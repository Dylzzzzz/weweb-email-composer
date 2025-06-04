# WeWeb Email Composer

A comprehensive email composition component for WeWeb that provides advanced recipient management, template support, merge fields, and file attachments.

## Features

### 📧 Email Composition
- Rich email editor with subject line and body composition
- Multiple email providers support (SMTP, SendGrid, Mailgun, Amazon SES)
- Sender configuration with custom from name and email

### 👥 Smart Recipient Management
- Smart recipient search with dropdown selection
- TO/CC/BCC fields with show/hide toggle
- Email parsing - paste "Dylan Halliday <dylan@test.com>" format
- Create new recipients with sliding panel form
- Dynamic form builder for recipient creation

### 📋 Template System
- Email templates with full merge field support
- Subject line templates with dynamic content
- Preview mode to see merged content before sending
- Template selection from data source

### 🔗 Merge Fields & Data Binding
- Multiple data sources for merge fields (recipients, properties, users, etc.)
- Configurable prefixes for different data types
- Real-time preview of merged content
- Linked record relationships for email history

### 📎 File Attachments
- Drag-and-drop file upload with visual dropzone
- File type validation with configurable allowed types
- File size limits with error handling
- File preview for images and text files
- Attachment list management with remove functionality

### 🎨 UI/UX Features
- Sliding panels for forms and attachments
- Responsive design for all screen sizes
- Compact mode for space-constrained layouts
- Customizable styling with CSS custom properties
- Loading states and error handling

## Installation

### Option 1: WeWeb Marketplace (Recommended)
```bash
weweb add-component weweb-email-composer
```

### Option 2: Manual Installation
1. Download the component files from this repository
2. Place in your WeWeb components directory
3. Import via WeWeb editor

## Quick Start

1. **Add the component** to your WeWeb page
2. **Configure data sources** in the component settings:
   - Recipients data source
   - Templates data source (optional)
   - Merge field data sources
3. **Set up email provider** configuration:
   ```javascript
   // Example SMTP configuration
   emailProvider: "smtp"
   fromEmail: "noreply@yourapp.com"
   fromName: "Your App Name"
   ```

## Data Structure

### Recipients Data Source
Your recipients collection should follow this structure:
```javascript
[
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    // ... additional fields
  }
]
```

### Templates Data Source (Optional)
```javascript
[
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome {{recipient.name}}!",
    body: "Hi {{recipient.name}},\n\nWelcome to {{company.name}}!"
  }
]
```

## Configuration

### Email Provider Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `emailProvider` | Select | "smtp" | Email service provider |
| `fromEmail` | Text | "" | Sender email address |
| `fromName` | Text | "" | Sender display name |

### Data Source Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `recipientDataSource` | Collection | null | Source for recipient data |
| `allowCreateRecipients` | Boolean | true | Allow creating new recipients |
| `templateDataSource` | Collection | null | Source for email templates |
| `mergeFieldSources` | Object | {} | Multiple data sources for merge fields |

### UI Customization

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `compactMode` | Boolean | false | Enable compact layout |
| `showCCByDefault` | Boolean | false | Show CC field by default |
| `showBCCByDefault` | Boolean | false | Show BCC field by default |
| `maxAttachmentSize` | Number | 10 | Max file size in MB |
| `allowedFileTypes` | Array | ["*"] | Allowed file extensions |

### Styling Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `primaryColor` | Color | "#3b82f6" | Primary accent color |
| `borderRadius` | Number | 8 | Border radius in px |
| `fontSize` | Number | 14 | Base font size |

## Merge Fields

The component supports dynamic merge fields using double curly braces `{{}}` syntax:

### Built-in Variables
- `{{recipient.name}}` - Recipient's name
- `{{recipient.email}}` - Recipient's email
- `{{sender.name}}` - Sender's name
- `{{sender.email}}` - Sender's email

### Custom Data Sources
Configure additional merge field sources in the component settings:
```javascript
mergeFieldSources: {
  property: propertyCollection,
  user: userCollection,
  company: companyCollection
}
```

Then use in templates:
- `{{property.address}}`
- `{{user.firstName}}`
- `{{company.name}}`

## Events

The component emits the following events:

| Event | Payload | Description |
|-------|---------|-------------|
| `email-sent` | `{ success: boolean, data: object }` | Fired when email is sent |
| `recipient-created` | `{ recipient: object }` | Fired when new recipient is created |
| `attachment-added` | `{ file: object }` | Fired when attachment is added |
| `template-selected` | `{ template: object }` | Fired when template is selected |

## Actions

Available component actions:

| Action | Parameters | Description |
|--------|------------|-------------|
| `sendEmail` | None | Trigger email sending |
| `clearComposer` | None | Clear all fields |
| `setTemplate` | `templateId: string` | Load specific template |
| `addRecipient` | `recipient: object` | Add recipient programmatically |

## Advanced Usage

### Custom Create Form
The component supports dynamic form creation for new recipients. Configure the form fields in the component settings:

```javascript
createFormFields: [
  { name: 'firstName', type: 'text', required: true },
  { name: 'lastName', type: 'text', required: true },
  { name: 'email', type: 'email', required: true },
  { name: 'phone', type: 'tel', required: false },
  { name: 'company', type: 'text', required: false }
]
```

### Email Provider Configuration

#### SMTP
```javascript
{
  provider: 'smtp',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password'
  }
}
```

#### SendGrid
```javascript
{
  provider: 'sendgrid',
  apiKey: 'your-sendgrid-api-key'
}
```

#### Mailgun
```javascript
{
  provider: 'mailgun',
  apiKey: 'your-mailgun-api-key',
  domain: 'your-domain.com'
}
```

## Styling & Customization

The component uses CSS custom properties for easy theming:

```css
.ww-email-composer {
  --primary-color: #3b82f6;
  --border-color: #e5e7eb;
  --background-color: #ffffff;
  --text-color: #374151;
  --border-radius: 8px;
  --spacing: 16px;
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### Common Issues

**Recipients not loading**
- Ensure your data source is properly configured
- Check that the data structure matches the expected format
- Verify data source permissions

**Templates not working**
- Confirm template data source is connected
- Check merge field syntax (use `{{}}`)
- Ensure template has both subject and body fields

**Attachments failing**
- Check file size limits
- Verify allowed file types configuration
- Ensure proper upload permissions

**Email not sending**
- Verify email provider configuration
- Check network connectivity
- Review email provider API limits

### Debug Mode

Enable debug mode to see detailed logs:
```javascript
debugMode: true
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the WeWeb community forums
- Review the WeWeb developer documentation

## Changelog

### v1.0.0
- Initial release
- Basic email composition
- Recipient management
- Template support
- Merge fields
- File attachments