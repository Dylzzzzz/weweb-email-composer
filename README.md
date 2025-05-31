# WeWeb Email Composer Component

A comprehensive email composition component for WeWeb that provides advanced recipient management, template support, merge fields, and file attachments.

## ✨ Features

### 📧 Email Composition
- **Rich email editor** with subject line and body composition
- **Multiple email providers** support (SMTP, SendGrid, Mailgun, Amazon SES)
- **Sender configuration** with custom from name and email

### 👥 Recipient Management
- **Smart recipient search** with dropdown selection
- **TO/CC/BCC fields** with show/hide toggle
- **Email parsing** - paste "Joe Bloggs <joe@test.com>" format
- **Create new recipients** with sliding panel form
- **Dynamic form builder** for recipient creation

### 📄 Template System
- **Email templates** with full merge field support
- **Subject line templates** with dynamic content
- **Preview mode** to see merged content before sending
- **Template selection** from data source

### 🔗 Merge Fields & Data Binding
- **Multiple data sources** for merge fields (recipients, properties, users, etc.)
- **Configurable prefixes** for different data types
- **Real-time preview** of merged content
- **Linked record relationships** for email history

### 📎 Attachment Management
- **Drag-and-drop file upload** with visual dropzone
- **File type validation** with configurable allowed types
- **File size limits** with error handling
- **File preview** for images and text files
- **Attachment list management** with remove functionality

### 🎨 UI/UX Features
- **Sliding panels** for forms and attachments
- **Responsive design** for all screen sizes
- **Compact mode** for space-constrained layouts
- **Customizable styling** with CSS custom properties
- **Loading states** and error handling

## 📦 Installation

1. **Add to your WeWeb project**:
   ```bash
   weweb add-component weweb-email-composer
   ```

2. **Or install manually**:
   - Download the component files
   - Place in your WeWeb components directory
   - Import via WeWeb editor

## 🚀 Quick Start

### Basic Setup

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

### Data Source Configuration

#### Recipients Data Structure
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

#### Templates Data Structure
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

## ⚙️ Configuration Options

### Email Settings
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `emailProvider` | Select | "smtp" | Email service provider |
| `fromEmail` | Text | "" | Sender email address |
| `fromName` | Text | "" | Sender display name |

### Recipient Settings
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `recipientDataSource` | Collection | null | Source for recipient data |
| `allowCreate
