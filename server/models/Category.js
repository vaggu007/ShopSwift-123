const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Hierarchical structure
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  level: {
    type: Number,
    default: 0
  },
  path: {
    type: String,
    default: ''
  },
  
  // Images
  image: {
    public_id: String,
    url: String,
    alt: String
  },
  banner: {
    public_id: String,
    url: String,
    alt: String
  },
  icon: {
    public_id: String,
    url: String,
    alt: String
  },
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  showInMenu: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  
  // Display Settings
  displayOrder: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
  },
  
  // SEO
  seo: {
    title: String,
    description: String,
    keywords: [String],
    canonicalUrl: String
  },
  
  // Analytics
  productCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  
  // Commission settings (for marketplace)
  commission: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Filters available for this category
  availableFilters: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['range', 'checkbox', 'radio', 'color'],
      required: true
    },
    options: [String],
    unit: String
  }],
  
  // Meta information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, status: 1 });
categorySchema.index({ level: 1, displayOrder: 1 });
categorySchema.index({ featured: 1, status: 1 });
categorySchema.index({ path: 1 });

// Virtual for full path name
categorySchema.virtual('fullPath').get(function() {
  return this.path ? `${this.path}/${this.name}` : this.name;
});

// Virtual for breadcrumb
categorySchema.virtual('breadcrumb').get(function() {
  if (!this.path) return [{ name: this.name, slug: this.slug }];
  
  const pathParts = this.path.split('/').filter(part => part);
  const breadcrumb = pathParts.map(part => ({ name: part, slug: slugify(part, { lower: true }) }));
  breadcrumb.push({ name: this.name, slug: this.slug });
  
  return breadcrumb;
});

// Virtual for is root category
categorySchema.virtual('isRoot').get(function() {
  return !this.parent;
});

// Virtual for has children
categorySchema.virtual('hasChildren').get(function() {
  return this.children && this.children.length > 0;
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { 
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Pre-save middleware to set level and path
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent') || this.isNew) {
    if (this.parent) {
      try {
        const parentCategory = await this.constructor.findById(this.parent);
        if (parentCategory) {
          this.level = parentCategory.level + 1;
          this.path = parentCategory.path ? `${parentCategory.path}/${parentCategory.name}` : parentCategory.name;
        }
      } catch (error) {
        return next(error);
      }
    } else {
      this.level = 0;
      this.path = '';
    }
  }
  next();
});

// Post-save middleware to update parent's children array
categorySchema.post('save', async function() {
  if (this.parent) {
    try {
      await this.constructor.findByIdAndUpdate(
        this.parent,
        { $addToSet: { children: this._id } }
      );
    } catch (error) {
      console.error('Error updating parent category:', error);
    }
  }
});

// Pre-remove middleware to handle children and products
categorySchema.pre('remove', async function(next) {
  try {
    // Move children to parent or root level
    if (this.children && this.children.length > 0) {
      await this.constructor.updateMany(
        { _id: { $in: this.children } },
        { parent: this.parent || null }
      );
    }
    
    // Remove this category from parent's children array
    if (this.parent) {
      await this.constructor.findByIdAndUpdate(
        this.parent,
        { $pull: { children: this._id } }
      );
    }
    
    // Handle products - move to parent category or mark as uncategorized
    const Product = mongoose.model('Product');
    if (this.parent) {
      await Product.updateMany(
        { category: this._id },
        { category: this.parent }
      );
    } else {
      // Create or find "Uncategorized" category
      let uncategorized = await this.constructor.findOne({ slug: 'uncategorized' });
      if (!uncategorized) {
        uncategorized = await this.constructor.create({
          name: 'Uncategorized',
          slug: 'uncategorized',
          createdBy: this.createdBy
        });
      }
      await Product.updateMany(
        { category: this._id },
        { category: uncategorized._id }
      );
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function(parentId = null) {
  const categories = await this.find({ 
    parent: parentId, 
    status: 'active',
    isVisible: true 
  })
  .sort({ displayOrder: 1, name: 1 })
  .lean();

  for (let category of categories) {
    category.children = await this.getCategoryTree(category._id);
  }

  return categories;
};

// Static method to get all descendants
categorySchema.statics.getDescendants = async function(categoryId) {
  const category = await this.findById(categoryId).populate('children');
  if (!category) return [];

  let descendants = [...category.children];
  
  for (let child of category.children) {
    const childDescendants = await this.getDescendants(child._id);
    descendants = descendants.concat(childDescendants);
  }

  return descendants;
};

// Static method to get breadcrumb trail
categorySchema.statics.getBreadcrumb = async function(categoryId) {
  const category = await this.findById(categoryId);
  if (!category) return [];

  const breadcrumb = [];
  let current = category;

  while (current) {
    breadcrumb.unshift({
      _id: current._id,
      name: current.name,
      slug: current.slug
    });

    if (current.parent) {
      current = await this.findById(current.parent);
    } else {
      current = null;
    }
  }

  return breadcrumb;
};

// Instance method to get all ancestors
categorySchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;

  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      ancestors.unshift(current);
    }
  }

  return ancestors;
};

// Instance method to get all descendants
categorySchema.methods.getDescendants = async function() {
  return await this.constructor.getDescendants(this._id);
};

// Instance method to update product count
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    category: this._id,
    status: 'active',
    isPublished: true
  });
  
  this.productCount = count;
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment views
categorySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Category', categorySchema);