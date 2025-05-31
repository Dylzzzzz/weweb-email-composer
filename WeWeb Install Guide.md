# WeWeb Email Composer - Integration Guide

This guide walks you through integrating the Email Composer component into your WeWeb project.

## Prerequisites

- WeWeb account with project access
- Basic understanding of WeWeb components
- Email service provider account (SMTP, SendGrid, etc.)

## Installation Steps

### Step 1: Add Component to WeWeb

#### Method A: From WeWeb Marketplace (Recommended)
1. Open your WeWeb project
2. Go to the Components section
3. Search for "Email Composer"
4. Click "Install" and follow the prompts

#### Method B: Manual Upload
1. Download the component files from GitHub
2. In WeWeb, go to **Components** → **Custom Components**
3. Click **"Upload Component"**
4. Select the component folder containing:
   - `ww.config.js`
   - `wwElement.vue`
   - `package.json`
5. Click **"Upload"**

### Step 2: Set Up Data Sources

#### Recipients Collection
1. Go to **Data** → **Collections**
2. Create a new collection called "Recipients" (or use existing)
3. Ensure it has these fields:
   ```json
   {
     "id": "string",
     "name": "string", 
     "email": "string",
     "firstName": "string (optional)",
     "lastName": "string (optional)"
   }
   ```

#### Email Templates Collection (Optional)
1. Create a collection called "EmailTemplates"
2. Add these fields:
   ```json
   {
     "id": "string",
     "name": "string",
     "subject": "string",
     "body": "string"
   }
   ```

### Step 3: Configure Email Provider

#### Using WeWeb Variables
1. Go to **Variables** → **Environment Variables**
2. Add your email provider credentials:
   ```
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@yourapp.com
   FROM_NAME=Your App Name
   ```

#### Using WeWeb Plugins
If you have email plugins installed:
1. Go to **Plugins** → **Your Email Plugin**
2. Configure the connection
3. Note the plugin ID for component binding

### Step 4: Add Component to Page

1. Open the page where you want the email composer
2. Drag the **Email Composer** component from the components panel
3. Position it where needed

### Step 5: Configure Component Properties

#### Basic Settings
1. Select the Email Composer component
2. In the **Properties** panel, configure:

   **Email Provider Settings:**
   - Email Provider: Select your provider (SMTP, SendGrid, etc.)
   - From Email: Bind to your variable or enter directly
   - From Name: Bind to your variable or enter directly

   **Data Sources:**
   - Recipients Data Source: Select your Recipients collection
   - Templates Data Source: Select your EmailTemplates collection (optional)

#### Advanced Settings
   **UI Configuration:**
   - Compact Mode: Enable for smaller layouts
   - Show CC by Default: Show CC field on load
   - Show BCC by Default: Show BCC field on load
   
   **File Upload Settings:**
   - Max Attachment Size: Set in MB (default: 10)
   - Allowed File Types: Array of extensions (e.g., [".pdf", ".jpg", ".png"])

### Step 6: Set Up Merge Fields (Optional)

If you want to use merge fields with additional data:

1. Create collections for your merge data (e.g., Properties, Companies)
2. In the component settings, configure **Merge Field Sources**:
   ```javascript
   {
     "property": "{{your-property-collection}}",
     "company": "{{your-company-collection}}",
     "user": "{{your-user-collection}}"
   }
   ```

### Step 7: Configure Actions & Events

#### Setting Up Send Email Action
1. Create a **Workflow** for sending emails
2. Add a **Custom Action** that calls your email service
3. Bind the component's `sendEmail` event to trigger this workflow

#### Example Workflow:
```javascript
// Workflow: Send Email
// Trigger: Component event "email-sent"
// Action: Call your email API
{
  "to": "{{email-composer.recipients}}",
  "subject": "{{email-composer.subject}}",
  "body": "{{email-composer.body}}",
  "attachments": "{{email-composer.attachments}}"
}
```

### Step 8: Style the Component

#### Using WeWeb Styling
1. Select the Email Composer component
2. Use the **Styling** panel to adjust:
   - Layout (width, height, margins)
   - Colors (primary color, background)
   - Typography (font size, font family)
   - Borders and shadows

#### Custom CSS
Add custom CSS in **Design** → **Custom CSS**:
```css
.ww-email-composer {
  --primary-color: #your-brand-color;
  --border-radius: 12px;
  --spacing: 20px;
}
```

## Testing Your Integration

### Step 1: Test Basic Functionality
1. Preview your page
2. Try typing in the recipient field
3. Verify dropdown shows your recipients
4. Test the "Create New" option

### Step 2: Test Email Parsing
1. Paste "John Doe <john@example.com>" in the recipient field
2. Verify it parses correctly
3. Check that create form slides out properly

### Step 3: Test Templates
1. Select a template from the dropdown
2. Verify subject and body populate
3. Check merge field preview works

### Step 4: Test Attachments
1. Click the attachment button
2. Try uploading different file types
3. Verify file size limits work

### Step 5: Test Email Sending
1. Compose a test email
2. Click send
3. Check your email provider logs
4. Verify email is received

## Common WeWeb Integration Patterns

### Binding to Current User
```javascript
// Bind sender info to current user
fromEmail: "{{current-user.email}}"
fromName: "{{current-user.name}}"
```

### Filtering Recipients by Role
```javascript
// Only show certain recipients
recipientFilter: "{{recipients.where(role='client')}}"
```

### Dynamic Template Loading
```javascript
// Load templates based on user role
templateFilter: "{{templates.where(userRole=current-user.role)}}"
```

### Conditional Visibility
```javascript
// Show component only for certain users
showIf: "{{current-user.permissions.includes('send-email')}}"
```

## Troubleshooting WeWeb Integration

### Component Not Appearing
- Check if upload was successful
- Verify all required files are present
- Refresh the WeWeb editor

### Data Not Loading
- Check collection permissions
- Verify data source bindings
- Test collections independently

### Styling Issues
- Check CSS conflicts with other components
- Verify custom CSS syntax
- Test in different screen sizes

### Email Not Sending
- Check email provider configuration
- Verify WeWeb variables are set correctly
- Test email provider connection independently

## Performance Optimization

### For Large Recipient Lists
- Implement pagination in your recipients collection
- Use search/filter to limit results
- Consider server-side filtering

### For Heavy Usage
- Cache template data
- Optimize image attachments
- Use WeWeb's built-in caching features

## Security Considerations

### Email Provider Credentials
- Use WeWeb environment variables
- Never hardcode credentials
- Rotate keys regularly

### File Uploads
- Validate file types on server
- Scan for malicious content
- Limit file sizes appropriately

### User Permissions
- Implement proper access controls
- Validate user permissions server-side
- Log email sending activities

## Support & Resources

- **WeWeb Documentation**: https://docs.weweb.io
- **WeWeb Community**: https://community.weweb.io
- **Component Issues**: Create issue on GitHub
- **WeWeb Support**: support@weweb.io

## Advanced WeWeb Customizations

### Custom Form Fields for Recipient Creation
```javascript
// In component settings
createFormFields: [
  { 
    name: 'firstName', 
    type: 'text', 
    label: 'First Name',
    required: true,
    wewebBinding: '{{new-recipient.firstName}}'
  },
  { 
    name: 'company', 
    type: 'select', 
    label: 'Company',
    options: '{{companies-collection}}',
    valueField: 'id',
    labelField: 'name'
  }
]
```

### Multi-language Support
```javascript
// Bind labels to WeWeb translations
labels: {
  to: "{{translations.email.to}}",
  subject: "{{translations.email.subject}}",
  send: "{{translations.email.send}}"
}
```

This integration guide should help you successfully implement the Email Composer component in your WeWeb project. Remember to test thoroughly before deploying to production!