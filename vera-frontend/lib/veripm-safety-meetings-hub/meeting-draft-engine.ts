/**
 * Regulation-aware safety meeting draft engine.
 * Grounds toolbox talks in CSA / provincial OHS / ANSI references —
 * deterministic, field-ready content (no LLM required).
 */

export type RegulationFramework = "CSA" | "OHS" | "ANSI" | "CCOHS";

export type RegulationCitation = {
  framework: RegulationFramework;
  code: string;
  title: string;
  note: string;
};

export type MeetingDraftSection = {
  id: string;
  heading: string;
  points: string[];
};

export type MeetingDraft = {
  title: string;
  meetingType: string;
  category: string;
  risk: "low" | "medium" | "high" | "critical";
  summary: string;
  durationMinutes: number;
  learningObjectives: string[];
  discussionPoints: string[];
  requiredControls: string[];
  attendanceChecks: string[];
  closingActions: string[];
  sections: MeetingDraftSection[];
  regulations: RegulationCitation[];
  facilitatorScript: string;
  sourceLabel: string;
};

type TopicPack = {
  match: RegExp;
  category: string;
  risk: MeetingDraft["risk"];
  summary: string;
  objectives: string[];
  discussion: string[];
  controls: string[];
  attendance: string[];
  closing: string[];
  sections: MeetingDraftSection[];
  regulations: RegulationCitation[];
  script: string;
};

const GENERIC_REGS: RegulationCitation[] = [
  {
    framework: "OHS",
    code: "Provincial OHS Act / Code",
    title: "Employer & worker duties",
    note: "Confirm local jurisdiction (e.g. Alberta OHS Code) for specific section numbers before delivery.",
  },
  {
    framework: "CCOHS",
    code: "CCOHS toolbox guidance",
    title: "Toolbox talk best practice",
    note: "Keep talks short, interactive, and tied to today’s tasks and controls.",
  },
];

const TOPIC_PACKS: TopicPack[] = [
  {
    match:
      /fall|harness|lanyard|srl|self.?retract|leading.?edge|work.?at.?height|anchor|lifeline/i,
    category: "Fall protection",
    risk: "critical",
    summary:
      "Protect workers from falls through competent use of CSA-aligned fall-arrest systems, anchor selection, and rescue readiness.",
    objectives: [
      "Identify when fall protection is required for today’s tasks",
      "Inspect harness, SRL/lanyard, and anchors before use",
      "Confirm rescue plan and competent person coverage",
    ],
    discussion: [
      "What fall hazards exist on this job today (edges, openings, scaffolds, ladders)?",
      "Is 100% tie-off required for the task sequence — including transitions?",
      "Who is the competent person / rescue lead if a fall occurs?",
      "Have SRL units been checked against CSA Z259.2.2 inspection intervals?",
      "Are leading-edge rated devices used where required?",
    ],
    controls: [
      "Full-body harness (CSA Z259.10) inspected and fitted",
      "Compatible SRL / energy absorber / lanyard for the exposure",
      "Engineered or certified anchor with adequate capacity",
      "Documented rescue plan and equipment staged",
      "Clear exclusion / drop zones below work",
    ],
    attendance: [
      "Confirm training / competency for fall protection users",
      "Visual check: harness worn correctly (chest & leg straps)",
      "Verify workers know their tie-off points for this shift",
    ],
    closing: [
      "Assign owner to close any defective gear red-tags",
      "Supervisor verifies rescue kit location before work starts",
      "Log toolbox talk attendance and open follow-ups",
    ],
    sections: [
      {
        id: "hazards",
        heading: "Today’s fall hazards",
        points: [
          "Walk the task: edges, floor openings, scaffolds, aerial lifts",
          "Call out unprotected sides / holes before work starts",
          "Include material handling near openings",
        ],
      },
      {
        id: "equipment",
        heading: "Equipment & inspection",
        points: [
          "Pre-use inspection of harness, connectors, SRL/lanyard",
          "Remove defective gear from service immediately",
          "Match device rating to leading-edge or sharp-edge exposure",
        ],
      },
      {
        id: "rescue",
        heading: "Rescue readiness",
        points: [
          "Name the rescue competent person on shift",
          "Confirm radio / phone coverage for emergency call",
          "Review suspension trauma risk and response time target",
        ],
      },
    ],
    regulations: [
      {
        framework: "CSA",
        code: "CSA Z259.10",
        title: "Full body harnesses",
        note: "Fit, inspection, and compatible connection points.",
      },
      {
        framework: "CSA",
        code: "CSA Z259.2.2",
        title: "Self-retracting devices",
        note: "SRL design, leading-edge use, and periodic inspection expectations.",
      },
      {
        framework: "CSA",
        code: "CSA Z259.16 / Z259.15",
        title: "Design of active fall-protection systems / anchors",
        note: "Anchor selection and system design by competent person.",
      },
      {
        framework: "OHS",
        code: "Provincial fall protection parts",
        title: "Fall protection plans & travel restraint",
        note: "Follow your jurisdiction’s fall protection plan thresholds and documentation.",
      },
      {
        framework: "ANSI",
        code: "ANSI/ASSP Z359",
        title: "Fall protection code (US / cross-border)",
        note: "Use when primes require ANSI Z359 alignment for multi-jurisdictional crews.",
      },
    ],
    script:
      "Today we focus on fall protection. Before anyone leaves the ground, we inspect gear, confirm anchors, and know who runs rescue. If the control isn’t ready, we stop the task.",
  },
  {
    match: /loto|lock.?out|tag.?out|energy|electrical|z462|arc.?flash/i,
    category: "Electrical / LOTO",
    risk: "critical",
    summary:
      "Verify zero energy before work — lockout/tagout, try-start, and CSA Z462 electrical safety practices.",
    objectives: [
      "Identify all energy sources for the equipment",
      "Apply personal locks and verify isolation",
      "Complete try-start before tools go on the machine",
    ],
    discussion: [
      "What energy types are present (electrical, pneumatic, hydraulic, gravity)?",
      "Who holds locks and where is the lockbox?",
      "Was try-start completed and documented?",
      "Are multi-crew group lockout procedures needed?",
    ],
    controls: [
      "Written LOTO procedure for the asset",
      "Personal locks / tags for each worker",
      "Verified isolation and try-start",
      "Arc-flash PPE where required (CSA Z462)",
    ],
    attendance: [
      "Confirm LOTO-authorized status for participants",
      "Show lockboard / lockbox location",
    ],
    closing: [
      "No re-energization until all locks cleared by owners",
      "Escalate incomplete isolation to supervisor immediately",
    ],
    sections: [
      {
        id: "isolate",
        heading: "Isolate & verify",
        points: [
          "Follow equipment-specific LOTO steps",
          "Account for stored and residual energy",
          "Try-start is mandatory — not optional",
        ],
      },
    ],
    regulations: [
      {
        framework: "CSA",
        code: "CSA Z462",
        title: "Workplace electrical safety",
        note: "Shock and arc-flash risk assessment, PPE, and approach boundaries.",
      },
      {
        framework: "OHS",
        code: "Provincial hazardous energy / LOTO",
        title: "Control of hazardous energy",
        note: "Lockout duties, group lockout, and verification requirements.",
      },
      {
        framework: "ANSI",
        code: "ANSI/ASSP Z244.1",
        title: "Control of hazardous energy",
        note: "Align cross-border LOTO programs where ANSI is referenced.",
      },
    ],
    script:
      "No work on energized equipment. We lock, tag, verify, and try-start. If you can’t prove zero energy, we do not start.",
  },
  {
    match: /ladder|scaffold|access|temporary.?platform|stair/i,
    category: "Ladder / access",
    risk: "high",
    summary:
      "Select, inspect, and use ladders and temporary access so three-point contact and secure footing are maintained.",
    objectives: [
      "Choose the right ladder/access for the task",
      "Inspect before use and set up on firm level ground",
      "Maintain three-point contact and secure tools",
    ],
    discussion: [
      "Is a ladder the right tool — or do we need a lift / scaffold?",
      "Extension past the landing and tie-off at top?",
      "Housekeeping at base and drop zone?",
    ],
    controls: [
      "Inspected ladder rated for load",
      "Secure footing / barricades as needed",
      "Three-point contact; no overreaching",
    ],
    attendance: ["Confirm workers know inspection defects that remove ladders from service"],
    closing: ["Tag out damaged ladders and notify supervisor"],
    sections: [
      {
        id: "setup",
        heading: "Setup",
        points: [
          "4:1 angle for extension ladders",
          "Spreaders locked on stepladders",
          "Do not stand on top cap / top step",
        ],
      },
    ],
    regulations: [
      {
        framework: "CSA",
        code: "CSA Z11",
        title: "Portable ladders",
        note: "Design, selection, and care of portable ladders.",
      },
      {
        framework: "OHS",
        code: "Provincial ladder / scaffold parts",
        title: "Safe access equipment",
        note: "Follow jurisdiction rules for ladder use and scaffold competence.",
      },
      {
        framework: "ANSI",
        code: "ANSI ASC A14",
        title: "Ladder safety standards",
        note: "Cross-border reference for portable and job-made ladders.",
      },
    ],
    script:
      "Right ladder, inspected, set correctly. Three-point contact. If it feels wrong, climb down and fix the setup.",
  },
  {
    match: /struck|crane|hoist|rigging|overhead|swing.?radius|signal/i,
    category: "Struck-by / lifting",
    risk: "high",
    summary:
      "Control struck-by exposure around lifts, mobile equipment, and overhead loads with clear communication and exclusion zones.",
    objectives: [
      "Establish exclusion / swing radius zones",
      "Confirm signal person and radio protocol",
      "Never walk under a suspended load",
    ],
    discussion: [
      "Where are today’s lift paths and blind spots?",
      "Who is the designated signal person?",
      "Are tag lines and softener controls in place?",
    ],
    controls: [
      "Barricaded swing radius / drop zone",
      "Qualified rigger / signal person",
      "Lift plan for critical lifts",
    ],
    attendance: ["Confirm visibility gear and radio channel"],
    closing: ["Stop work if communication or exclusion zone breaks down"],
    sections: [
      {
        id: "comms",
        heading: "Communication",
        points: [
          "One signal person at a time",
          "Agree on emergency stop signal",
          "Spotters for reversing equipment",
        ],
      },
    ],
    regulations: [
      {
        framework: "ANSI",
        code: "ANSI A10 / ASME B30",
        title: "Construction & crane standards",
        note: "Signal person qualification and lift planning expectations.",
      },
      {
        framework: "OHS",
        code: "Provincial powered mobile equipment / lifting",
        title: "Cranes, hoists, and mobile equipment",
        note: "Operator competency, swing radius, and load chart compliance.",
      },
      {
        framework: "CSA",
        code: "CSA Z150 (where applicable)",
        title: "Safety on mobile cranes",
        note: "Canadian crane safety practices for applicable equipment classes.",
      },
    ],
    script:
      "Nothing moves until exclusion zones and signals are clear. No one under the load — ever.",
  },
  {
    match: /ppe|glove|eye|hearing|respirator|hi.?vis|personal.?protective/i,
    category: "PPE",
    risk: "medium",
    summary:
      "Match PPE to task hazards and keep it serviceable — minimum site PPE plus task-specific upgrades.",
    objectives: [
      "Confirm site minimum PPE for this area",
      "Upgrade PPE for task-specific hazards",
      "Replace damaged PPE before work",
    ],
    discussion: [
      "What extras are needed today (cut, chemical, respiratory, hearing)?",
      "Any fit-test or cartridge change requirements?",
    ],
    controls: ["Site PPE minimum", "Task-specific PPE per SDS / JHA", "Clean / replace damaged gear"],
    attendance: ["Visual PPE check before dispersing"],
    closing: ["Restock PPE crib shortages after the talk"],
    sections: [
      {
        id: "fit",
        heading: "Fit & condition",
        points: ["No cracks in eyewear", "Hearing protection rated for noise", "Gloves matched to hazard"],
      },
    ],
    regulations: [
      {
        framework: "CSA",
        code: "CSA Z94 series",
        title: "PPE standards (eye, head, footwear, etc.)",
        note: "Select CSA-certified PPE appropriate to the hazard.",
      },
      {
        framework: "OHS",
        code: "Provincial PPE requirements",
        title: "Worker PPE duties",
        note: "Employer provides; worker uses and reports defects.",
      },
      {
        framework: "ANSI",
        code: "ANSI/ISEA Z87 / Z89",
        title: "Eye and head protection",
        note: "Common cross-border PPE markings.",
      },
    ],
    script:
      "PPE is the last line of defense — but only if it fits the hazard and is in good condition. Fix it before you start.",
  },
  {
    match: /housekeep|slip|trip|debris|walkway|cable|clutter/i,
    category: "Housekeeping",
    risk: "medium",
    summary:
      "Keep access routes clear — most slip/trip injuries are preventable with disciplined housekeeping.",
    objectives: [
      "Clear travel paths and exits",
      "Manage cords, hoses, and scrap",
      "Assign end-of-shift cleanup owners",
    ],
    discussion: [
      "Where are today’s worst trip points?",
      "Who owns cleanup at break and end of shift?",
    ],
    controls: ["Clear aisles", "Cord management", "Waste bins staged"],
    attendance: ["Walk the path from muster to work face"],
    closing: ["Photo or note remaining hazards for shift handover"],
    sections: [
      {
        id: "paths",
        heading: "Paths & storage",
        points: ["No materials in doorways", "Stack stable", "Ice/mud control in season"],
      },
    ],
    regulations: [
      {
        framework: "OHS",
        code: "Provincial general safety / housekeeping",
        title: "Safe workplace condition",
        note: "Maintain floors, aisles, and means of egress free of hazards.",
      },
      {
        framework: "CCOHS",
        code: "CCOHS slips, trips & falls",
        title: "Prevention guidance",
        note: "Practical controls for industrial and construction sites.",
      },
    ],
    script:
      "If you walk it, keep it clear. Housekeeping is part of the job — not optional overtime.",
  },
];

const FALLBACK_PACK: Omit<TopicPack, "match"> = {
  category: "General safety",
  risk: "medium",
  summary:
    "Reinforce stop-work authority, hazard recognition, and controls for today’s planned work.",
  objectives: [
    "Review today’s tasks and primary hazards",
    "Confirm controls from JHA / FLHA are in place",
    "Practice stop-work if conditions change",
  ],
  discussion: [
    "What is the highest-risk step in today’s work?",
    "What controls must be verified before start?",
    "How do we escalate if conditions change?",
    "Who has stop-work authority? (Everyone.)",
  ],
  controls: [
    "Task-specific JHA / FLHA reviewed",
    "Required PPE for the area",
    "Emergency muster and contact known",
  ],
  attendance: [
    "Confirm workers understand the task scope",
    "Capture attendance for the record",
  ],
  closing: [
    "Open corrective / preventive follow-ups if gaps found",
    "Supervisor sign-off before release to work",
  ],
  sections: [
    {
      id: "plan",
      heading: "Plan the work",
      points: [
        "Walk through the sequence",
        "Name energy sources and exposures",
        "Agree on communication and emergency response",
      ],
    },
    {
      id: "do",
      heading: "Do the work safely",
      points: [
        "Use controls as written — no shortcuts",
        "Reassess after breaks or crew changes",
        "Report near-misses immediately",
      ],
    },
  ],
  regulations: GENERIC_REGS,
  script:
    "We talk so everyone goes home safe. If something feels off, stop the work and fix the control before continuing.",
};

function pickPack(title: string): Omit<TopicPack, "match"> {
  for (const pack of TOPIC_PACKS) {
    if (pack.match.test(title)) {
      const { match: _m, ...rest } = pack;
      return rest;
    }
  }
  return FALLBACK_PACK;
}

const MEETING_TYPE_DURATION: Record<string, number> = {
  toolbox_talk: 12,
  tailgate_meeting: 15,
  safety_stand_down: 30,
  daily_safety_briefing: 8,
  weekly_safety_meeting: 25,
  incident_review_meeting: 35,
  custom: 15,
};

export function buildRegulationAwareMeetingDraft(input: {
  title: string;
  meetingType: string;
  siteContext?: string;
}): MeetingDraft {
  const title = input.title.trim() || "Safety meeting";
  const pack = pickPack(title);
  const durationMinutes =
    MEETING_TYPE_DURATION[input.meetingType] ?? 15;

  const regulations = [...pack.regulations];
  // Always surface generic OHS duty if pack didn't already include OHS
  if (!regulations.some((r) => r.framework === "OHS")) {
    regulations.push(GENERIC_REGS[0]);
  }

  return {
    title,
    meetingType: input.meetingType,
    category: pack.category,
    risk: pack.risk,
    summary: pack.summary,
    durationMinutes,
    learningObjectives: pack.objectives,
    discussionPoints: pack.discussion,
    requiredControls: pack.controls,
    attendanceChecks: pack.attendance,
    closingActions: pack.closing,
    sections: pack.sections,
    regulations,
    facilitatorScript: pack.script,
    sourceLabel: "VeriPM regulation engine · CSA / OHS / ANSI",
  };
}

/** Map a free-text topic into suggested titles for the builder. */
export function suggestRegulationTopics(seed?: string): Array<{
  id: string;
  title: string;
  category: string;
  risk: MeetingDraft["risk"];
  rationale: string;
}> {
  const catalog = [
    {
      id: "fall",
      title: "Fall protection — harness, SRL & rescue",
      category: "Fall protection",
      risk: "critical" as const,
      rationale: "CSA Z259 suite + provincial fall protection plan",
    },
    {
      id: "loto",
      title: "LOTO & zero-energy verification",
      category: "Electrical / LOTO",
      risk: "critical" as const,
      rationale: "CSA Z462 + hazardous energy control",
    },
    {
      id: "ladder",
      title: "Ladder & temporary access safety",
      category: "Ladder / access",
      risk: "high" as const,
      rationale: "CSA Z11 + safe access practice",
    },
    {
      id: "struck",
      title: "Struck-by & lift exclusion zones",
      category: "Struck-by / lifting",
      risk: "high" as const,
      rationale: "ANSI A10 / ASME B30 + OHS lifting rules",
    },
    {
      id: "ppe",
      title: "PPE selection & condition checks",
      category: "PPE",
      risk: "medium" as const,
      rationale: "CSA Z94 series + site PPE minimums",
    },
    {
      id: "house",
      title: "Housekeeping — slips, trips & clear paths",
      category: "Housekeeping",
      risk: "medium" as const,
      rationale: "OHS general safety + CCOHS guidance",
    },
  ];

  if (!seed?.trim()) return catalog;
  const q = seed.toLowerCase();
  const hit = catalog.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.rationale.toLowerCase().includes(q),
  );
  return hit.length ? hit : catalog;
}
