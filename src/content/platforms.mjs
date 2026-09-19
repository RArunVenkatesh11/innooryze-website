// Discovery guidance for confirmed platform experience; no partnership or certification claims.
export const platformContent = {
  "salesforce": {
    "title": "Make the customer record useful to the people doing the work.",
    "intro": "For a Salesforce engagement, start by tracing how a customer moves between marketing, sales and service. The useful brief defines who owns the record, what makes it actionable and how the next team receives the right context.",
    "chapters": [
      [
        "Clarify the handoff",
        "Map enquiry intake, qualification, ownership and follow-up. Agree the information a team needs before moving a record to the next stage, and identify where manual re-entry or unclear responsibility interrupts the journey."
      ],
      [
        "Connect the surrounding ecosystem",
        "Identify the website, marketing and reporting connections that matter to the first use case. Document the system of record, field definitions and exception handling before deciding how to implement each connection."
      ],
      [
        "Plan for everyday operation",
        "Include user acceptance, team enablement and ongoing ownership in the delivery scope. A useful CRM workflow needs people who understand what to update, what to review and how to resolve an incomplete record."
      ]
    ],
    "service": 1,
    "article": "3-common-mistakes-in-martech-implementation"
  },
  "adobe": {
    "title": "Connect the content experience with the work behind it.",
    "intro": "Adobe-related work starts with the experience a customer should have and the team that must deliver it. Define the content, campaign or journey requirement first, then assess which parts of the existing ecosystem need attention.",
    "chapters": [
      [
        "Begin with a real customer journey",
        "Describe the audience, the task and the desired next interaction. Review where content becomes inconsistent, where the journey loses context and what the business needs to learn from each touchpoint."
      ],
      [
        "Make delivery responsibilities explicit",
        "Map the people who create, approve, publish and maintain the experience. Connect content structure and design decisions to realistic workflows, integrations and team capacity."
      ],
      [
        "Define a useful first release",
        "Agree a bounded delivery scope, the acceptance criteria and the signals that will guide improvement. Product selection and integration details belong in discovery; they should not be assumed from a vendor name alone."
      ]
    ],
    "service": 0,
    "article": "3-common-mistakes-in-martech-implementation"
  },
  "braze": {
    "title": "Give lifecycle engagement a clear purpose and an owner.",
    "intro": "A Braze engagement should connect the customer moment with the message, the supporting data and the team responsible for the next step. Start with a useful lifecycle scenario rather than a larger campaign calendar.",
    "chapters": [
      [
        "Choose the customer moment",
        "Define who should receive the communication, why it is useful and what action should follow. Map entry conditions, exclusions and the experience when a customer has already completed the intended action."
      ],
      [
        "Check the signals and permissions",
        "Identify the events and customer attributes required for that scenario. Review data quality, consent, timing and ownership before turning the journey into an operating workflow."
      ],
      [
        "Build a learning rhythm",
        "Agree review points for message relevance, delivery exceptions and journey performance. Include the people who maintain campaigns and the systems receiving the next action so the process can improve after launch."
      ]
    ],
    "service": 1,
    "article": "3-common-mistakes-in-martech-implementation"
  },
  "segment": {
    "title": "Turn customer signals into a shared, usable foundation.",
    "intro": "For Segment-related work, the starting point is the decision or customer experience that better data should support. Agree the use case before expanding collection, and make each signal understandable to the people who depend on it.",
    "chapters": [
      [
        "Define the collection contract",
        "Map the events, attributes and source systems needed for the first use case. Agree consistent names, definitions, owners and quality checks so teams can interpret the same customer behaviour in the same way."
      ],
      [
        "Resolve customer context deliberately",
        "Review identifiers, consent and the boundaries between source systems. Decide how missing or conflicting information should be handled, and which team is accountable for the underlying definitions."
      ],
      [
        "Design the activation path",
        "Identify the audience, analytics or experience destination that will use the data. Validate the complete path from collection to a useful action, with a clear way to monitor quality and maintain the connection."
      ]
    ],
    "service": 2,
    "article": "choosing-the-right-cdp-for-your-growth-stage"
  }
};
