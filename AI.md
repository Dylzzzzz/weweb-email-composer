# WeWeb Email Composer - AI Integration Guide

## Overview
This document provides guidance for AI assistants working with the WeWeb Email Composer component. It includes component architecture, common customization patterns, and troubleshooting information.

## Component Architecture

### Core Files Structure
```
weweb-email-composer/
├── wwElement.vue          # Main component
├── ww-config.js          # WeWeb configuration
├── package.json          # Package configuration
├── components/
│   ├── RecipientInput.vue     # Recipient search & selection
│   ├── CreateRecipientForm.vue # Dynamic recipient creation form
│   ├── SlidePanel.vue         # Sliding panel container
│   └── AttachmentManager.vue  # File upload & management
├── README.md
└── AI.md                 # This file
```

### Key Features
- **Recipient Management**: Search, create, and manage email recipients with TO/CC/BCC support
- **Template System**: Apply templates with merge field support
- **Attachment Handling**: Drag-and-drop file uploads with validation
- **Merge Fields**: Dynamic content replacement from linked data sources
- **Responsive Design**: Works across desktop and mobile devices

## Configuration Properties

### Email Settings
- `emailProvider`: SMTP, SendGrid, Mailgun, Amazon SES
- `fromEmail`, `fromName`: Sender information

### Recipient Management
- `recipientDataSource`: Collection binding for recipient data
- `allowCreateRecipient`: Enable/disable recipient creation
- `createRecipientFields`: Dynamic form field configuration

### Template System
- `enableTemplates`: Toggle template functionality
- `templatesDataSource`: Collection of email templates
- `enableMergeFields`: Toggle merge field processing
- `mergeFieldsDataSources`: Data sources for merge field replacement

### Attachments
- `enableAttachments`: Toggle file attachment feature
- `maxAttachmentSize`: File size limit in MB
- `allowedFileTypes`: Array of permitted file extensions

## Common Customization Patterns

### Adding New Email Providers
```javascript
// In ww-config.js, add to emailProvider options
{
  value: "custom-provider",
  label: "Custom Provider"
}
```

### Custom Merge Field Sources
```javascript
// Add new data source to mergeFieldsDataSources default value
{
  name: "company",
  label: "Company Data", 
  dataSource: null,
  prefix: "company"
}
```

### Extended File Type Support
```javascript
// In ww-config.js, extend allowedFileTypes
defaultValue: [".pdf", ".doc", ".docx", ".txt", ".csv", ".zip"]
```

## Event System

### Triggered Events
1. **email:send** - Fired when email is sent
   ```javascript
   {
     email: emailData,
     recipients: [...],
     subject: "...",
     body: "...",
     attachments: [...],
     linkedRecords: {...}
   }
   ```

2. **recipient:create** - Fired when new recipient is created
   ```javascript
   {
     recipient: newRecipientData
   }
   ```

3. **template:preview** - Fired when template preview is toggled
   ```javascript
   {
     template: templateData,
     mergedContent: "processed content"
   }
   ```

## Data Binding Patterns

### Recipient Data Structure
```javascript
{
  id: "unique-identifier",
  name: "Full Name",
  email: "email@domain.com",
  // Additional custom fields...
}
```

### Template Data Structure
```javascript
{
  id: "template-id",
  name: "Template Name",
  subject: "Email Subject with {{merge.fields}}",
  body: "Email body with {{recipient.name}} and {{property.address}}"
}
```

## Merge Field Processing

### Syntax
- Recipient fields: `{{recipient.fieldName}}`
- Custom data sources: `{{prefix.fieldName}}`
- Example: `{{property.address}}`, `{{user.firstName}}`

### Processing Logic
1. Linked records are processed first
2. Recipient data is processed second
3. Fallback to empty string for missing values
4. HTML line breaks are preserved in preview mode

## Troubleshooting Guide

### Common Issues

#### Recipients Not Loading
- Check `recipientDataSource` binding
- Verify field mapping: `recipientNameField`, `recipientEmailField`, `recipientIdField`
- Ensure data source returns array format

#### Templates Not Appearing
- Verify `templatesDataSource` binding
- Check `enableTemplates` is true
- Confirm template field mappings

#### Merge Fields Not Working
- Enable `enableMergeFields`
- Check `mergeFieldsDataSources` configuration
- Verify linked records are properly selected
- Ensure merge field syntax: `{{prefix.field}}`

#### File Upload Issues
- Check `maxAttachmentSize` setting
- Verify `allowedFileTypes` includes desired extensions
- Browser file API support required

### Performance Considerations
- Limit recipient data source size for better search performance
- Template processing is reactive - avoid unnecessary re-renders
- File preview generation happens on-demand
- Consider pagination for large recipient lists

## Extension Points

### Custom Recipient Validation
Extend `RecipientInput.vue` with custom validation logic:
```javascript
validateRecipient(recipient) {
  // Custom validation logic
  return isValid
}
```

### Custom Template Processing
Extend merge field processing in `wwElement.vue`:
```javascript
processCustomMergeFields(content, data) {
  // Custom merge field logic
  return processedContent
}
```

### Custom File Handling
Extend `AttachmentManager.vue` for specialized file processing:
```javascript
processSpecialFile(file) {
  // Custom file processing
  return processedFile
}
```

## WeWeb Integration Best Practices

1. **Always use `wwLib.resolveValue()`** for data source bindings
2. **Emit events properly** using `$emit('trigger-event', eventData)`
3. **Handle responsive properties** through WeWeb's built-in system
4. **Use computed properties** for reactive data processing
5. **Maintain flat content structure** for better WeWeb integration

## Development Tips for AI Assistants

### When Modifying Configuration
- Always update both `ww-config.js` properties and component logic
- Test property visibility conditions (`hidden` functions)
- Verify default values make sense

### When Adding Features  
- Follow Vue 3 Composition API patterns where beneficial
- Maintain backward compatibility with existing configurations
- Add appropriate error handling and validation

### When Debugging
- Check browser console for Vue warnings
- Verify WeWeb data binding in editor mode
- Test component in both editor and preview modes
- Validate event emission in parent workflows

## Version History Notes
- v1.0.0: Initial release with core email composition features
- Future versions should maintain configuration compatibility
- Breaking changes require version bump and migration guide