export default {
  editor: {
    label: {
      en: "Email Composer",
      fr: "Compositeur d'email"
    },
    icon: "mail",
    bubble: {
      icon: "mail"
    },
    customStylePropertiesOrder: [
      "emailSettings",
      "recipientSettings", 
      "templateSettings",
      "attachmentSettings",
      "uiSettings"
    ],
    customSettingsPropertiesOrder: [
      "dataBinding",
      "emailConfiguration",
      "recipientConfiguration",
      "templateConfiguration"
    ]
  },
  triggerEvents: [
    {
      name: "email:send",
      label: { en: "On email send", fr: "À l'envoi d'email" },
      event: {
        email: null,
        recipients: [],
        subject: "",
        body: "",
        attachments: [],
        linkedRecords: {}
      },
      default: true
    },
    {
      name: "recipient:create", 
      label: { en: "On recipient create", fr: "À la création de destinataire" },
      event: {
        recipient: null
      }
    },
    {
      name: "template:preview",
      label: { en: "On template preview", fr: "À la prévisualisation du template" }, 
      event: {
        template: null,
        mergedContent: ""
      }
    }
  ],
  properties: {
    // Email Settings
    emailProvider: {
      label: { en: "Email Provider", fr: "Fournisseur d'email" },
      type: "TextSelect",
      section: "emailSettings",
      options: {
        options: [
          { value: "smtp", label: "SMTP" },
          { value: "sendgrid", label: "SendGrid" },
          { value: "mailgun", label: "Mailgun" },
          { value: "ses", label: "Amazon SES" }
        ]
      },
      defaultValue: "smtp"
    },
    fromEmail: {
      label: { en: "From Email", fr: "Email expéditeur" },
      type: "Text",
      section: "emailSettings",
      bindable: true,
      defaultValue: ""
    },
    fromName: {
      label: { en: "From Name", fr: "Nom expéditeur" },
      type: "Text", 
      section: "emailSettings",
      bindable: true,
      defaultValue: ""
    },
    
    // Recipient Settings
    recipientDataSource: {
      label: { en: "Recipients Data Source", fr: "Source de données des destinataires" },
      type: "Collection",
      section: "recipientSettings",
      bindable: true
    },
    recipientNameField: {
      label: { en: "Name Field", fr: "Champ nom" },
      type: "Text",
      section: "recipientSettings", 
      defaultValue: "name"
    },
    recipientEmailField: {
      label: { en: "Email Field", fr: "Champ email" },
      type: "Text",
      section: "recipientSettings",
      defaultValue: "email"
    },
    recipientIdField: {
      label: { en: "ID Field", fr: "Champ ID" },
      type: "Text",
      section: "recipientSettings",
      defaultValue: "id"
    },
    allowCreateRecipient: {
      label: { en: "Allow Create New Recipient", fr: "Permettre créer nouveau destinataire" },
      type: "Boolean",
      section: "recipientSettings",
      defaultValue: true
    },
    createRecipientFields: {
      label: { en: "Create Form Fields", fr: "Champs formulaire création" },
      type: "Array",
      section: "recipientSettings",
      options: {
        item: {
          type: "Object",
          options: {
            item: {
              name: { type: "Text" },
              label: { type: "Text" },
              type: { 
                type: "TextSelect",
                options: {
                  options: [
                    { value: "text", label: "Text" },
                    { value: "email", label: "Email" },
                    { value: "tel", label: "Phone" },
                    { value: "textarea", label: "Textarea" },
                    { value: "select", label: "Select" },
                    { value: "checkbox", label: "Checkbox" }
                  ]
                }
              },
              required: { type: "Boolean" },
              placeholder: { type: "Text" }
            }
          }
        }
      },
      defaultValue: [
        { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "Enter first name" },
        { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Enter last name" },
        { name: "email", label: "Email", type: "email", required: true, placeholder: "Enter email address" },
        { name: "phone", label: "Phone", type: "tel", required: false, placeholder: "Enter phone number" }
      ]
    },
    
    // CC/BCC Settings
    showCcBcc: {
      label: { en: "Show CC/BCC by default", fr: "Afficher CC/BCC par défaut" },
      type: "Boolean",
      section: "recipientSettings",
      defaultValue: false
    },
    
    // Template Settings
    enableTemplates: {
      label: { en: "Enable Templates", fr: "Activer les templates" },
      type: "Boolean",
      section: "templateSettings",
      defaultValue: true
    },
    templatesDataSource: {
      label: { en: "Templates Data Source", fr: "Source de données des templates" },
      type: "Collection",
      section: "templateSettings",
      bindable: true,
      hidden: content => !content.enableTemplates
    },
    templateNameField: {
      label: { en: "Template Name Field", fr: "Champ nom template" },
      type: "Text",
      section: "templateSettings",
      defaultValue: "name",
      hidden: content => !content.enableTemplates
    },
    templateSubjectField: {
      label: { en: "Template Subject Field", fr: "Champ sujet template" },
      type: "Text", 
      section: "templateSettings",
      defaultValue: "subject",
      hidden: content => !content.enableTemplates
    },
    templateBodyField: {
      label: { en: "Template Body Field", fr: "Champ corps template" },
      type: "Text",
      section: "templateSettings", 
      defaultValue: "body",
      hidden: content => !content.enableTemplates
    },
    
    // Merge Fields
    enableMergeFields: {
      label: { en: "Enable Merge Fields", fr: "Activer les champs de fusion" },
      type: "Boolean",
      section: "templateSettings",
      defaultValue: true
    },
    mergeFieldsDataSources: {
      label: { en: "Merge Fields Data Sources", fr: "Sources de données pour fusion" },
      type: "Array",
      section: "templateSettings",
      options: {
        item: {
          type: "Object", 
          options: {
            item: {
              name: { type: "Text" },
              label: { type: "Text" },
              dataSource: { type: "Collection", bindable: true },
              prefix: { type: "Text" }
            }
          }
        }
      },
      defaultValue: [
        { name: "recipient", label: "Recipient", dataSource: null, prefix: "recipient" },
        { name: "property", label: "Property", dataSource: null, prefix: "property" },
        { name: "user", label: "Current User", dataSource: null, prefix: "user" }
      ],
      hidden: content => !content.enableMergeFields
    },
    
    // Attachment Settings  
    enableAttachments: {
      label: { en: "Enable Attachments", fr: "Activer les pièces jointes" },
      type: "Boolean",
      section: "attachmentSettings",
      defaultValue: true
    },
    maxAttachmentSize: {
      label: { en: "Max Attachment Size (MB)", fr: "Taille max pièce jointe (MB)" },
      type: "Number",
      section: "attachmentSettings",
      defaultValue: 25,
      hidden: content => !content.enableAttachments
    },
    allowedFileTypes: {
      label: { en: "Allowed File Types", fr: "Types de fichiers autorisés" },
      type: "Array",
      section: "attachmentSettings",
      options: {
        item: { type: "Text" }
      },
      defaultValue: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".png", ".gif"],
      hidden: content => !content.enableAttachments
    },
    
    // UI Settings
    compactMode: {
      label: { en: "Compact Mode", fr: "Mode compact" },
      type: "Boolean", 
      section: "uiSettings",
      defaultValue: false
    },
    showPreviewButton: {
      label: { en: "Show Preview Button", fr: "Afficher bouton aperçu" },
      type: "Boolean",
      section: "uiSettings", 
      defaultValue: true
    },
    primaryColor: {
      label: { en: "Primary Color", fr: "Couleur primaire" },
      type: "Color",
      section: "uiSettings",
      defaultValue: "#3B82F6"
    },
    borderRadius: {
      label: { en: "Border Radius", fr: "Rayon des bordures" },
      type: "Length",
      section: "uiSettings",
      defaultValue: "8px"
    }
  }
};