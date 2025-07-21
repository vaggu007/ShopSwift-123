const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

// Email templates
const emailTemplates = {
  emailVerification: {
    subject: 'Welcome to ShopSwift - Verify Your Email',
    template: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ShopSwift!</h1>
        </div>
        <div style="padding: 40px 20px; background: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi {{name}},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Thank you for signing up with ShopSwift! We're excited to have you join our community of smart shoppers.
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            To get started, please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{verificationUrl}}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="{{verificationUrl}}" style="color: #2563eb;">{{verificationUrl}}</a>
          </p>
          <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours for security reasons.
          </p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 {{appName}}. All rights reserved.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `
  },

  passwordReset: {
    subject: 'ShopSwift Password Reset Request',
    template: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        <div style="padding: 40px 20px; background: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi {{name}},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            You recently requested to reset your password for your ShopSwift account. Click the button below to reset it.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{resetUrl}}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="{{resetUrl}}" style="color: #dc2626;">{{resetUrl}}</a>
          </p>
          <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
            This link will expire in 10 minutes for security reasons.
          </p>
          <p style="color: #666; line-height: 1.6; font-size: 14px; background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin-top: 20px;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 {{appName}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  orderConfirmation: {
    subject: 'Order Confirmation - {{orderNumber}}',
    template: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
        </div>
        <div style="padding: 40px 20px; background: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi {{customerName}},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Thank you for your order! We've received your order and are preparing it for shipment.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Order Details</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Order Number:</strong> {{orderNumber}}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Order Date:</strong> {{orderDate}}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Total:</strong> ${{total}}</p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{trackingUrl}}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Track Your Order
            </a>
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 {{appName}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  orderShipped: {
    subject: 'Your Order Has Been Shipped - {{orderNumber}}',
    template: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Order Shipped!</h1>
        </div>
        <div style="padding: 40px 20px; background: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi {{customerName}},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Great news! Your order has been shipped and is on its way to you.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Shipping Details</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Order Number:</strong> {{orderNumber}}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Tracking Number:</strong> {{trackingNumber}}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Carrier:</strong> {{carrier}}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{trackingUrl}}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Track Package
            </a>
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 {{appName}}. All rights reserved.</p>
        </div>
      </div>
    `
  }
};

// Create transporter
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };

  // Use service if specified
  if (process.env.EMAIL_SERVICE) {
    config.service = process.env.EMAIL_SERVICE;
  }

  return nodemailer.createTransporter(config);
};

// Replace template variables
const replaceTemplateVariables = (template, data) => {
  let result = template;
  
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key] || '');
  });
  
  return result;
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    let { email, subject, message, template, data = {} } = options;

    // Use template if specified
    if (template && emailTemplates[template]) {
      const templateData = emailTemplates[template];
      subject = subject || replaceTemplateVariables(templateData.subject, data);
      message = replaceTemplateVariables(templateData.template, data);
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'ShopSwift'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: message
    };

    // Add plain text version
    if (message) {
      mailOptions.text = message.replace(/<[^>]*>/g, ''); // Strip HTML tags for text version
    }

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send bulk emails
const sendBulkEmail = async (recipients, options) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const emailOptions = {
        ...options,
        email: recipient.email,
        data: { ...options.data, ...recipient.data }
      };
      
      const result = await sendEmail(emailOptions);
      results.push({ email: recipient.email, success: true, messageId: result.messageId });
    } catch (error) {
      results.push({ email: recipient.email, success: false, error: error.message });
    }
  }
  
  return results;
};

// Send email with retry
const sendEmailWithRetry = async (options, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendEmail(options);
    } catch (error) {
      lastError = error;
      console.log(`Email sending attempt ${i + 1} failed:`, error.message);
      
      if (i < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError;
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration verification failed:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  sendEmailWithRetry,
  verifyEmailConfig,
  emailTemplates
};