// Platform taxonomy explicitly approved in the final production brief.
export const platformCatalog = {
  "leadryze-crm": {
    "slug": "leadryze-crm",
    "name": "LeadRyze CRM",
    "owned": true,
    "href": "/platforms#leadryze-crm"
  },
  "salesforce": {
    "slug": "salesforce",
    "name": "Salesforce",
    "image": "/assets/platforms/salesforce-logo.svg",
    "href": "/platforms/salesforce"
  },
  "hubspot": {
    "slug": "hubspot",
    "name": "HubSpot",
    "image": "/assets/platforms/hubspot-logo.webp",
    "href": "/platforms#hubspot"
  },
  "zoho": {
    "slug": "zoho",
    "name": "Zoho",
    "image": "/assets/platforms/zoho-logo.webp",
    "href": "/platforms#zoho"
  },
  "salesforce-marketing-cloud": {
    "slug": "salesforce-marketing-cloud",
    "name": "Salesforce Marketing Cloud",
    "image": "/assets/platforms/salesforce-marketing-cloud-logo.png",
    "href": "/platforms#salesforce-marketing-cloud"
  },
  "mailchimp": {
    "slug": "mailchimp",
    "name": "Mailchimp",
    "image": "/assets/platforms/mailchimp-logo.svg",
    "href": "/platforms#mailchimp"
  },
  "oracle-eloqua": {
    "slug": "oracle-eloqua",
    "name": "Oracle Eloqua",
    "image": "/assets/platforms/oracle-eloqua-logo.png",
    "href": "/platforms#oracle-eloqua"
  },
  "adobe-marketo-engage": {
    "slug": "adobe-marketo-engage",
    "name": "Adobe Marketo Engage",
    "image": "/assets/platforms/adobe-marketo-engage-logo.webp",
    "href": "/platforms#adobe-marketo-engage"
  },
  "adobe-campaign": {
    "slug": "adobe-campaign",
    "name": "Adobe Campaign",
    "image": "/assets/platforms/adobe-campaign-logo.png",
    "href": "/platforms#adobe-campaign"
  },
  "segment": {
    "slug": "segment",
    "name": "Segment",
    "image": "/assets/platforms/segment-logo.svg",
    "href": "/platforms/segment"
  },
  "tealium": {
    "slug": "tealium",
    "name": "Tealium",
    "image": "/assets/platforms/tealium-logo.webp",
    "href": "/platforms#tealium"
  },
  "adobe-experience-platform": {
    "slug": "adobe-experience-platform",
    "name": "Adobe Experience Platform",
    "image": "/assets/platforms/adobe-experience-platform-logo.png",
    "href": "/platforms#adobe-experience-platform"
  },
  "adobe-experience-manager": {
    "slug": "adobe-experience-manager",
    "name": "Adobe Experience Manager",
    "image": "/assets/platforms/adobe-experience-manager-logo.png",
    "href": "/platforms#adobe-experience-manager"
  },
  "drupal": {
    "slug": "drupal",
    "name": "Drupal",
    "image": "/assets/platforms/drupal-logo.png",
    "href": "/platforms#drupal"
  },
  "wordpress": {
    "slug": "wordpress",
    "name": "WordPress",
    "image": "/assets/platforms/wordpress-logo.webp",
    "href": "/platforms#wordpress"
  },
  "google-analytics": {
    "slug": "google-analytics",
    "name": "Google Analytics",
    "image": "/assets/platforms/google-analytics-logo.webp",
    "href": "/platforms#google-analytics"
  },
  "adobe-analytics": {
    "slug": "adobe-analytics",
    "name": "Adobe Analytics",
    "image": "/assets/platforms/adobe-analytics-logo.png",
    "href": "/platforms#adobe-analytics"
  },
  "power-bi": {
    "slug": "power-bi",
    "name": "Microsoft Power BI",
    "image": "/assets/platforms/power-bi-logo.png",
    "href": "/platforms#power-bi"
  },
  "tableau": {
    "slug": "tableau",
    "name": "Tableau",
    "image": "/assets/platforms/tableau-logo.webp",
    "href": "/platforms#tableau"
  },
  "braze": {
    "slug": "braze",
    "name": "Braze",
    "image": "/assets/platforms/braze-logo.svg",
    "href": "/platforms/braze"
  },
  "adobe": {
    "slug": "adobe",
    "name": "Adobe",
    "image": "/assets/platforms/adobe-logo.png",
    "href": "/platforms/adobe"
  }
};
export const platformCategories = [
  {
    "id": "crm",
    "name": "CRM",
    "context": "Customer relationships, shared context and the next useful handoff.",
    "items": [
      "leadryze-crm",
      "salesforce",
      "hubspot",
      "zoho"
    ]
  },
  {
    "id": "marketing-automation",
    "name": "Marketing Automation",
    "context": "Connected campaign and lifecycle workflows, built around the people operating them.",
    "items": [
      "salesforce-marketing-cloud",
      "mailchimp",
      "hubspot",
      "zoho",
      "oracle-eloqua",
      "adobe-marketo-engage",
      "adobe-campaign",
      "braze"
    ]
  },
  {
    "id": "customer-data",
    "name": "Customer Data / CDP",
    "context": "A useful foundation for customer context, segmentation and activation.",
    "items": [
      "segment",
      "tealium",
      "adobe-experience-platform"
    ]
  },
  {
    "id": "digital-experience",
    "name": "Digital Experience / CMS",
    "context": "Content and digital experiences with a clear path from creation to delivery.",
    "items": [
      "adobe-experience-manager",
      "drupal",
      "wordpress"
    ]
  },
  {
    "id": "analytics",
    "name": "Analytics & Business Intelligence",
    "context": "Shared measurement and reporting that help teams understand what happens next.",
    "items": [
      "google-analytics",
      "adobe-analytics",
      "power-bi",
      "tableau"
    ]
  }
];
export const featuredPlatforms = ["zoho","salesforce","adobe-experience-platform","braze","segment"];
export const platformSummaries = {
  "zoho": [
    "CRM & marketing",
    "Connect the customer relationship with the work around it."
  ],
  "salesforce": [
    "CRM & customer engagement",
    "Connect customer context with the teams who act on it."
  ],
  "adobe-experience-platform": [
    "Customer experience & data",
    "Bring customer context into a connected experience."
  ],
  "braze": [
    "Customer engagement",
    "Coordinate relevant engagement across the customer lifecycle."
  ],
  "segment": [
    "Customer data",
    "Build useful customer context from connected data."
  ]
};
