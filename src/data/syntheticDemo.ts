import { Case, SourceDocument, Entity, Relationship, IdentityCandidate, Contradiction, TimelineEvent } from '../types';

export const SYNTHETIC_CASE_ID = 'case-harbor-ledger-demo';

export const SYNTHETIC_CASE: Case = {
  id: SYNTHETIC_CASE_ID,
  name: 'Operation Harbor Ledger',
  description: 'Multi-source investigation into illicit cargo diversions, front companies, and logistics discrepancies across Pier 4 and Harbor Holdings.',
  referenceNumber: 'FED-2024-HL-882',
  status: 'active',
  createdAt: '2024-03-10T09:00:00Z',
  updatedAt: '2024-03-16T14:30:00Z',
  isSynthetic: true,
  sourceCount: 6,
  entityCount: 11,
  relationshipCount: 14,
  unresolvedIdentityCount: 1,
  contradictionCount: 1,
};

export const INITIAL_DOCUMENTS: SourceDocument[] = [
  {
    id: 'src-01-surveillance',
    caseId: SYNTHETIC_CASE_ID,
    filename: 'Report_01_Customs_Surveillance.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 3420,
    fileHash: 'sha256-7fa88c12b910e4a',
    uploadedAt: '2024-03-15T08:12:00Z',
    processingStatus: 'ready',
    rawText: `PORT SURVEILLANCE REPORT — FIELD OFFICE NORTH
DATE: 2024-03-14 | INCIDENT ID: INC-8821-B
AGENT: Inv. Miller | LOCATION: Pier 4 Container Freight Station

02:15 HRS: Team observed a navy blue cargo van (license plate V-7892) pull into Pier 4 Bay 3.
02:30 HRS: Subject identified by field informant as Arun Patel, Logistics Director of Apex Marine Corp, arrived on foot from the administration building.
02:45 HRS: Patel was observed conferring with the driver and placing a heavy sealed pelican case into van V-7892.
03:05 HRS: Subject Patel conducted a brief telephone call using mobile number +1-555-0192 before departing east on Harbor Boulevard.
03:20 HRS: Cargo container APX-8802 was unsealed without customs clearance stamps. Apex Marine Corp is listed as consignee.`,
    segments: [
      {
        id: 'seg-01-1',
        sourceId: 'src-01-surveillance',
        segmentType: 'text',
        pageNumber: 1,
        exactText: 'Team observed a navy blue cargo van (license plate V-7892) pull into Pier 4 Bay 3.',
        context: 'Surveillance Log 02:15 HRS'
      },
      {
        id: 'seg-01-2',
        sourceId: 'src-01-surveillance',
        segmentType: 'text',
        pageNumber: 1,
        exactText: 'Subject identified by field informant as Arun Patel, Logistics Director of Apex Marine Corp, arrived on foot from the administration building.',
        context: 'Surveillance Log 02:30 HRS'
      },
      {
        id: 'seg-01-3',
        sourceId: 'src-01-surveillance',
        segmentType: 'text',
        pageNumber: 1,
        exactText: 'Subject Patel conducted a brief telephone call using mobile number +1-555-0192 before departing east on Harbor Boulevard.',
        context: 'Surveillance Log 03:05 HRS'
      },
      {
        id: 'seg-01-4',
        sourceId: 'src-01-surveillance',
        segmentType: 'text',
        pageNumber: 1,
        exactText: 'Cargo container APX-8802 was unsealed without customs clearance stamps. Apex Marine Corp is listed as consignee.',
        context: 'Surveillance Log 03:20 HRS'
      }
    ]
  },
  {
    id: 'src-02-witness',
    caseId: SYNTHETIC_CASE_ID,
    filename: 'Report_02_Witness_Interview_Elena.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 2840,
    fileHash: 'sha256-4c919e18b820aa1',
    uploadedAt: '2024-03-15T09:40:00Z',
    processingStatus: 'ready',
    rawText: `INVESTIGATION DIVISION — WITNESS INTERVIEW RECORD
CASE: Operation Harbor Ledger | SUBJECT: Elena Rostova (Driver / Independent Contractor)
DATE: 2024-03-15 11:00 EST | INTERVIEWER: Det. S. Vance

Q: Can you describe your vehicle and work arrangements on the night of March 14?
ROSTOVA: I drive a blue Ford Transit cargo van, registration plate V-7892. I am the sole private owner of this vehicle; I bought it privately in January 2024 for my courier business.

Q: Who contracted you to pick up cargo at Pier 4?
ROSTOVA: I received a call on my cell (+1-555-0612) from David Vance at Orion Freight Ltd. He instructed me to meet an associate at Pier 4 Bay 3. He paid me $1,200 via bank transfer to deliver the equipment to an off-site holding unit.

Q: Did you see who delivered the package?
ROSTOVA: A man in high-visibility gear handed me the pelican case. He said his name was Arun. I did not ask questions.`,
    segments: [
      {
        id: 'seg-02-1',
        sourceId: 'src-02-witness',
        segmentType: 'text',
        pageNumber: 1,
        exactText: 'I drive a blue Ford Transit cargo van, registration plate V-7892. I am the sole private owner of this vehicle; I bought it privately in January 2024 for my courier business.',
        context: 'Witness Statement Q1'
      },
      {
        id: 'seg-02-2',
        sourceId: 'src-02-witness',
        segmentType: 'text',
        pageNumber: 1,
        exactText: 'I received a call on my cell (+1-555-0612) from David Vance at Orion Freight Ltd. He instructed me to meet an associate at Pier 4 Bay 3.',
        context: 'Witness Statement Q2'
      },
      {
        id: 'seg-02-3',
        sourceId: 'src-02-witness',
        segmentType: 'text',
        pageNumber: 1,
        exactText: 'A man in high-visibility gear handed me the pelican case. He said his name was Arun.',
        context: 'Witness Statement Q3'
      }
    ]
  },
  {
    id: 'src-03-audit',
    caseId: SYNTHETIC_CASE_ID,
    filename: 'Report_03_Customs_Broker_Audit.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 2210,
    fileHash: 'sha256-11f8b417c80a22d',
    uploadedAt: '2024-03-15T11:15:00Z',
    processingStatus: 'ready',
    rawText: `CUSTOMS CLEARANCE COMPLIANCE AUDIT
EXAMINER: Trade Compliance Bureau | AUDIT REF: AUD-2024-4091

Review of entry filings for Pier 4 indicates that Customs Entry Form CF-7501 was filed by Licensed Customs Broker Arun K. Patel (License #CB-9921, Brokerage Office: Bayview Trade Advisory).
Broker Phone: +1-555-0841.
Client of Record: Orion Freight Ltd (Tax ID: 84-291019).
Consignment: Electronic maritime components declared at $85,000.
Note: Broker Arun K. Patel operates an independent agency and claims no corporate executive affiliation with shipping companies.`,
    segments: [
      {
        id: 'seg-03-1',
        sourceId: 'src-03-audit',
        segmentType: 'text',
        pageNumber: 1,
        exactText: 'Customs Entry Form CF-7501 was filed by Licensed Customs Broker Arun K. Patel (License #CB-9921, Brokerage Office: Bayview Trade Advisory). Broker Phone: +1-555-0841.',
        context: 'Audit Section 1'
      },
      {
        id: 'seg-03-2',
        sourceId: 'src-03-audit',
        segmentType: 'text',
        pageNumber: 1,
        exactText: 'Client of Record: Orion Freight Ltd (Tax ID: 84-291019).',
        context: 'Audit Section 2'
      },
      {
        id: 'seg-03-3',
        sourceId: 'src-03-audit',
        segmentType: 'text',
        pageNumber: 1,
        exactText: 'Broker Arun K. Patel operates an independent agency and claims no corporate executive affiliation with shipping companies.',
        context: 'Audit Section 3'
      }
    ]
  },
  {
    id: 'src-04-transactions',
    caseId: SYNTHETIC_CASE_ID,
    filename: 'Transactions_Harbor_Ledger.csv',
    fileType: 'csv',
    mimeType: 'text/csv',
    fileSize: 1890,
    fileHash: 'sha256-990a14bc493812f',
    uploadedAt: '2024-03-15T13:00:00Z',
    processingStatus: 'ready',
    rowCount: 5,
    rawText: `TransactionID,Date,OriginAccount,DestinationAccount,OriginEntity,DestinationEntity,AmountUSD,Reference
TX-10492,2024-03-12,ACC-88210,ACC-44910,Orion Freight Ltd,Apex Marine Corp,240000.00,"Pier 4 Logistics Handling Advance"
TX-10498,2024-03-14,ACC-44910,ACC-99014,Apex Marine Corp,Harbor Holdings LLC,195000.00,"Warehouse Sublease Bay 3-B"
TX-10501,2024-03-15,ACC-99014,ACC-11204,Harbor Holdings LLC,David Vance,45000.00,"Consulting & Management Fee"
TX-10504,2024-03-15,ACC-88210,ACC-33918,Orion Freight Ltd,Elena Rostova,1200.00,"Courier Retainer Escort"`,
    segments: [
      {
        id: 'seg-04-1',
        sourceId: 'src-04-transactions',
        segmentType: 'csv_row',
        rowNumber: 2,
        exactText: 'TX-10492 | 2024-03-12 | Orion Freight Ltd -> Apex Marine Corp | $240,000.00 | Ref: Pier 4 Logistics Handling Advance',
        context: 'CSV Row 2'
      },
      {
        id: 'seg-04-2',
        sourceId: 'src-04-transactions',
        segmentType: 'csv_row',
        rowNumber: 3,
        exactText: 'TX-10498 | 2024-03-14 | Apex Marine Corp -> Harbor Holdings LLC | $195,000.00 | Ref: Warehouse Sublease Bay 3-B',
        context: 'CSV Row 3'
      },
      {
        id: 'seg-04-3',
        sourceId: 'src-04-transactions',
        segmentType: 'csv_row',
        rowNumber: 4,
        exactText: 'TX-10501 | 2024-03-15 | Harbor Holdings LLC -> David Vance | $45,000.00 | Ref: Consulting & Management Fee',
        context: 'CSV Row 4'
      },
      {
        id: 'seg-04-4',
        sourceId: 'src-04-transactions',
        segmentType: 'csv_row',
        rowNumber: 5,
        exactText: 'TX-10504 | 2024-03-15 | Orion Freight Ltd -> Elena Rostova | $1,200.00 | Ref: Courier Retainer Escort',
        context: 'CSV Row 5'
      }
    ]
  },
  {
    id: 'src-05-calls',
    caseId: SYNTHETIC_CASE_ID,
    filename: 'Call_Records_Sprint_Mar2024.csv',
    fileType: 'csv',
    mimeType: 'text/csv',
    fileSize: 1450,
    fileHash: 'sha256-44b81099238e910',
    uploadedAt: '2024-03-15T14:10:00Z',
    processingStatus: 'ready',
    rowCount: 4,
    rawText: `CallID,Timestamp,OriginNumber,DestinationNumber,DurationSec,TowerID
CDR-8810,2024-03-13 18:22:10,+1-555-0192,+1-555-0377,245,TOW-PORT-04
CDR-8819,2024-03-14 01:15:40,+1-555-0377,+1-555-0612,180,TOW-PORT-02
CDR-8824,2024-03-14 03:05:12,+1-555-0192,+1-555-0377,95,TOW-PORT-04
CDR-8830,2024-03-14 03:40:05,+1-555-0612,+1-555-0377,60,TOW-HWY-09`,
    segments: [
      {
        id: 'seg-05-1',
        sourceId: 'src-05-calls',
        segmentType: 'csv_row',
        rowNumber: 2,
        exactText: 'CDR-8810 | 2024-03-13 18:22:10 | +1-555-0192 (Arun Patel) -> +1-555-0377 (David Vance) | 245s | Tower: TOW-PORT-04',
        context: 'Call Record Row 2'
      },
      {
        id: 'seg-05-2',
        sourceId: 'src-05-calls',
        segmentType: 'csv_row',
        rowNumber: 3,
        exactText: 'CDR-8819 | 2024-03-14 01:15:40 | +1-555-0377 (David Vance) -> +1-555-0612 (Elena Rostova) | 180s | Tower: TOW-PORT-02',
        context: 'Call Record Row 3'
      },
      {
        id: 'seg-05-3',
        sourceId: 'src-05-calls',
        segmentType: 'csv_row',
        rowNumber: 4,
        exactText: 'CDR-8824 | 2024-03-14 03:05:12 | +1-555-0192 (Arun Patel) -> +1-555-0377 (David Vance) | 95s | Tower: TOW-PORT-04',
        context: 'Call Record Row 4'
      }
    ]
  },
  {
    id: 'src-06-registry',
    caseId: SYNTHETIC_CASE_ID,
    filename: 'Vehicle_Registry_PortAuthority.csv',
    fileType: 'csv',
    mimeType: 'text/csv',
    fileSize: 1120,
    fileHash: 'sha256-aa18392019b8823',
    uploadedAt: '2024-03-15T15:00:00Z',
    processingStatus: 'ready',
    rowCount: 2,
    rawText: `Plate,VIN,MakeModel,Year,RegisteredOwner,RegistrationDate,FleetTag,Status
V-7892,1FTNE3Y89MKA8821,Ford Transit Cargo,2021,Apex Marine Corp,2022-04-10,APX-FLEET-04,Active Commercial Permit`,
    segments: [
      {
        id: 'seg-06-1',
        sourceId: 'src-06-registry',
        segmentType: 'csv_row',
        rowNumber: 2,
        exactText: 'Plate V-7892 | VIN: 1FTNE3Y89MKA8821 | 2021 Ford Transit Cargo | Registered Owner: Apex Marine Corp | Registered: 2022-04-10 | FleetTag: APX-FLEET-04',
        context: 'Vehicle Registry Row 2'
      }
    ]
  }
];

export const INITIAL_ENTITIES: Entity[] = [
  {
    id: 'ent-arun-patel',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: 'Arun Patel',
    entityType: 'person',
    identifiers: { role: 'Logistics Director', company: 'Apex Marine Corp', phone: '+1-555-0192' },
    mentionCount: 5,
    componentId: 1
  },
  {
    id: 'ent-arun-k-patel',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: 'Arun K. Patel',
    entityType: 'person',
    identifiers: { license: 'CB-9921', agency: 'Bayview Trade Advisory', phone: '+1-555-0841' },
    mentionCount: 3,
    componentId: 1
  },
  {
    id: 'ent-apex-marine',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: 'Apex Marine Corp',
    entityType: 'organisation',
    identifiers: { taxId: 'TAX-APX-4491', facility: 'Pier 4' },
    mentionCount: 6,
    componentId: 1
  },
  {
    id: 'ent-orion-freight',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: 'Orion Freight Ltd',
    entityType: 'organisation',
    identifiers: { taxId: '84-291019', bankAccount: 'ACC-88210' },
    mentionCount: 5,
    componentId: 1
  },
  {
    id: 'ent-david-vance',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: 'David Vance',
    entityType: 'person',
    identifiers: { phone: '+1-555-0377', role: 'Director, Orion Freight' },
    mentionCount: 5,
    componentId: 1
  },
  {
    id: 'ent-elena-rostova',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: 'Elena Rostova',
    entityType: 'person',
    identifiers: { phone: '+1-555-0612', business: 'Courier Contractor' },
    mentionCount: 4,
    componentId: 1
  },
  {
    id: 'ent-van-v7892',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: 'Vehicle V-7892',
    entityType: 'vehicle',
    identifiers: { plate: 'V-7892', vin: '1FTNE3Y89MKA8821', model: '2021 Ford Transit Blue' },
    mentionCount: 5,
    componentId: 1
  },
  {
    id: 'ent-pier-4',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: 'Pier 4 Container Station',
    entityType: 'location',
    identifiers: { facilityId: 'PORT-PIER-04' },
    mentionCount: 4,
    componentId: 1
  },
  {
    id: 'ent-phone-0192',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: '+1-555-0192',
    entityType: 'phone',
    identifiers: { carrier: 'Sprint Wireless', subscriber: 'Arun Patel / Apex Marine' },
    mentionCount: 3,
    componentId: 1
  },
  {
    id: 'ent-phone-0377',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: '+1-555-0377',
    entityType: 'phone',
    identifiers: { carrier: 'Sprint Wireless', subscriber: 'David Vance' },
    mentionCount: 3,
    componentId: 1
  },
  // Previously isolated component 2: Harbor Holdings
  {
    id: 'ent-harbor-holdings',
    caseId: SYNTHETIC_CASE_ID,
    canonicalName: 'Harbor Holdings LLC',
    entityType: 'organisation',
    identifiers: { account: 'ACC-99014', location: 'Warehouse 9' },
    mentionCount: 3,
    componentId: 2
  }
];

export const INITIAL_RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel-01',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-arun-patel',
    targetEntityId: 'ent-apex-marine',
    relationshipType: 'directed',
    label: 'Logistics Director',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    evidenceReferences: [
      {
        sourceId: 'src-01-surveillance',
        sourceFilename: 'Report_01_Customs_Surveillance.txt',
        sourceType: 'txt',
        segmentId: 'seg-01-2',
        pageOrRow: 'Page 1, 02:30 HRS',
        exactQuotation: 'Subject identified by field informant as Arun Patel, Logistics Director of Apex Marine Corp, arrived on foot from the administration building.',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-14'
      }
    ]
  },
  {
    id: 'rel-02',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-arun-patel',
    targetEntityId: 'ent-phone-0192',
    relationshipType: 'operated',
    label: 'Operated Mobile Line',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    evidenceReferences: [
      {
        sourceId: 'src-01-surveillance',
        sourceFilename: 'Report_01_Customs_Surveillance.txt',
        sourceType: 'txt',
        segmentId: 'seg-01-3',
        pageOrRow: 'Page 1, 03:05 HRS',
        exactQuotation: 'Subject Patel conducted a brief telephone call using mobile number +1-555-0192 before departing east on Harbor Boulevard.',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-14'
      }
    ]
  },
  {
    id: 'rel-03',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-phone-0192',
    targetEntityId: 'ent-phone-0377',
    relationshipType: 'communicated_with',
    label: 'CDR Call Exchange (2 calls)',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    evidenceReferences: [
      {
        sourceId: 'src-05-calls',
        sourceFilename: 'Call_Records_Sprint_Mar2024.csv',
        sourceType: 'csv',
        segmentId: 'seg-05-1',
        pageOrRow: 'Row 2',
        exactQuotation: 'CDR-8810 | 2024-03-13 18:22:10 | +1-555-0192 (Arun Patel) -> +1-555-0377 (David Vance) | 245s',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-13'
      },
      {
        sourceId: 'src-05-calls',
        sourceFilename: 'Call_Records_Sprint_Mar2024.csv',
        sourceType: 'csv',
        segmentId: 'seg-05-3',
        pageOrRow: 'Row 4',
        exactQuotation: 'CDR-8824 | 2024-03-14 03:05:12 | +1-555-0192 (Arun Patel) -> +1-555-0377 (David Vance) | 95s',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-14'
      }
    ]
  },
  {
    id: 'rel-04',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-david-vance',
    targetEntityId: 'ent-phone-0377',
    relationshipType: 'operated',
    label: 'Primary Contact Number',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    evidenceReferences: [
      {
        sourceId: 'src-02-witness',
        sourceFilename: 'Report_02_Witness_Interview_Elena.txt',
        sourceType: 'txt',
        segmentId: 'seg-02-2',
        pageOrRow: 'Page 1, Q2',
        exactQuotation: 'I received a call on my cell (+1-555-0612) from David Vance at Orion Freight Ltd.',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-14'
      }
    ]
  },
  {
    id: 'rel-05',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-david-vance',
    targetEntityId: 'ent-orion-freight',
    relationshipType: 'directed',
    label: 'Director & Authorized Officer',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    evidenceReferences: [
      {
        sourceId: 'src-02-witness',
        sourceFilename: 'Report_02_Witness_Interview_Elena.txt',
        sourceType: 'txt',
        segmentId: 'seg-02-2',
        pageOrRow: 'Page 1, Q2',
        exactQuotation: 'David Vance at Orion Freight Ltd. He instructed me to meet an associate at Pier 4 Bay 3.',
        extractionMethod: 'deterministic'
      }
    ]
  },
  {
    id: 'rel-06',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-orion-freight',
    targetEntityId: 'ent-apex-marine',
    relationshipType: 'transferred_to',
    label: 'Wire Transfer $240,000 USD',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    eventDate: '2024-03-12',
    evidenceReferences: [
      {
        sourceId: 'src-04-transactions',
        sourceFilename: 'Transactions_Harbor_Ledger.csv',
        sourceType: 'csv',
        segmentId: 'seg-04-1',
        pageOrRow: 'Row 2',
        exactQuotation: 'TX-10492 | 2024-03-12 | Orion Freight Ltd -> Apex Marine Corp | $240,000.00 | Ref: Pier 4 Logistics Handling Advance',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-12'
      }
    ]
  },
  {
    id: 'rel-07',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-van-v7892',
    targetEntityId: 'ent-apex-marine',
    relationshipType: 'registered_owner',
    label: 'Official DMV Registered Owner',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    evidenceReferences: [
      {
        sourceId: 'src-06-registry',
        sourceFilename: 'Vehicle_Registry_PortAuthority.csv',
        sourceType: 'csv',
        segmentId: 'seg-06-1',
        pageOrRow: 'Row 2',
        exactQuotation: 'Plate V-7892 | Registered Owner: Apex Marine Corp | Registered: 2022-04-10 | FleetTag: APX-FLEET-04',
        extractionMethod: 'deterministic',
        dateCited: '2022-04-10'
      }
    ]
  },
  {
    id: 'rel-08',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-elena-rostova',
    targetEntityId: 'ent-van-v7892',
    relationshipType: 'operated',
    label: 'Operated / Claimed Ownership',
    assertionStatus: 'reported_allegation',
    reviewStatus: 'pending_review',
    evidenceReferences: [
      {
        sourceId: 'src-02-witness',
        sourceFilename: 'Report_02_Witness_Interview_Elena.txt',
        sourceType: 'txt',
        segmentId: 'seg-02-1',
        pageOrRow: 'Page 1, Q1',
        exactQuotation: 'I drive a blue Ford Transit cargo van, registration plate V-7892. I am the sole private owner of this vehicle; I bought it privately in January 2024 for my courier business.',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-15'
      }
    ]
  },
  {
    id: 'rel-09',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-orion-freight',
    targetEntityId: 'ent-elena-rostova',
    relationshipType: 'transferred_to',
    label: 'Paid Courier Fee $1,200',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    eventDate: '2024-03-15',
    evidenceReferences: [
      {
        sourceId: 'src-04-transactions',
        sourceFilename: 'Transactions_Harbor_Ledger.csv',
        sourceType: 'csv',
        segmentId: 'seg-04-4',
        pageOrRow: 'Row 5',
        exactQuotation: 'TX-10504 | 2024-03-15 | Orion Freight Ltd -> Elena Rostova | $1,200.00 | Ref: Courier Retainer Escort',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-15'
      }
    ]
  },
  {
    id: 'rel-10',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-arun-patel',
    targetEntityId: 'ent-pier-4',
    relationshipType: 'witnessed_at',
    label: 'Observed at Bay 3',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    eventDate: '2024-03-14',
    evidenceReferences: [
      {
        sourceId: 'src-01-surveillance',
        sourceFilename: 'Report_01_Customs_Surveillance.txt',
        sourceType: 'txt',
        segmentId: 'seg-01-2',
        pageOrRow: 'Page 1, 02:30 HRS',
        exactQuotation: 'Arun Patel, Logistics Director of Apex Marine Corp, arrived on foot from the administration building.',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-14'
      }
    ]
  },
  {
    id: 'rel-11',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-van-v7892',
    targetEntityId: 'ent-pier-4',
    relationshipType: 'co_located',
    label: 'Observed Loading at Bay 3',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    eventDate: '2024-03-14',
    evidenceReferences: [
      {
        sourceId: 'src-01-surveillance',
        sourceFilename: 'Report_01_Customs_Surveillance.txt',
        sourceType: 'txt',
        segmentId: 'seg-01-1',
        pageOrRow: 'Page 1, 02:15 HRS',
        exactQuotation: 'Team observed a navy blue cargo van (license plate V-7892) pull into Pier 4 Bay 3.',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-14'
      }
    ]
  },
  {
    id: 'rel-12',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-arun-k-patel',
    targetEntityId: 'ent-orion-freight',
    relationshipType: 'associated_with',
    label: 'Customs Entry Broker (CF-7501)',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    evidenceReferences: [
      {
        sourceId: 'src-03-audit',
        sourceFilename: 'Report_03_Customs_Broker_Audit.txt',
        sourceType: 'txt',
        segmentId: 'seg-03-1',
        pageOrRow: 'Audit Ref AUD-2024-4091',
        exactQuotation: 'Customs Entry Form CF-7501 was filed by Licensed Customs Broker Arun K. Patel (License #CB-9921, Brokerage Office: Bayview Trade Advisory). Broker Phone: +1-555-0841. Client of Record: Orion Freight Ltd',
        extractionMethod: 'deterministic'
      }
    ]
  },
  // Isolated component relationships:
  {
    id: 'rel-13',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-apex-marine',
    targetEntityId: 'ent-harbor-holdings',
    relationshipType: 'transferred_to',
    label: 'Sublease Payment $195,000 USD',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    eventDate: '2024-03-14',
    evidenceReferences: [
      {
        sourceId: 'src-04-transactions',
        sourceFilename: 'Transactions_Harbor_Ledger.csv',
        sourceType: 'csv',
        segmentId: 'seg-04-2',
        pageOrRow: 'Row 3',
        exactQuotation: 'TX-10498 | 2024-03-14 | Apex Marine Corp -> Harbor Holdings LLC | $195,000.00 | Ref: Warehouse Sublease Bay 3-B',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-14'
      }
    ]
  },
  {
    id: 'rel-14',
    caseId: SYNTHETIC_CASE_ID,
    sourceEntityId: 'ent-harbor-holdings',
    targetEntityId: 'ent-david-vance',
    relationshipType: 'transferred_to',
    label: 'Consulting Payout $45,000 USD',
    assertionStatus: 'direct_statement',
    reviewStatus: 'confirmed',
    eventDate: '2024-03-15',
    evidenceReferences: [
      {
        sourceId: 'src-04-transactions',
        sourceFilename: 'Transactions_Harbor_Ledger.csv',
        sourceType: 'csv',
        segmentId: 'seg-04-3',
        pageOrRow: 'Row 4',
        exactQuotation: 'TX-10501 | 2024-03-15 | Harbor Holdings LLC -> David Vance | $45,000.00 | Ref: Consulting & Management Fee',
        extractionMethod: 'deterministic',
        dateCited: '2024-03-15'
      }
    ]
  }
];

export const INITIAL_IDENTITIES: IdentityCandidate[] = [
  {
    id: 'id-cand-01',
    caseId: SYNTHETIC_CASE_ID,
    entityAId: 'ent-arun-patel',
    entityBId: 'ent-arun-k-patel',
    nameA: 'Arun Patel',
    nameB: 'Arun K. Patel',
    type: 'person',
    reason: 'Phonetic and orthographic name similarity across customs and logistics documentation.',
    supportingFields: [
      { field: 'Jurisdiction', valA: 'Port Authority District 4', valB: 'Port Authority District 4' },
      { field: 'Associated Client', valA: 'Apex Marine Corp', valB: 'Orion Freight Ltd' }
    ],
    conflictingFields: [
      { field: 'Phone Number', valA: '+1-555-0192', valB: '+1-555-0841' },
      { field: 'Professional Role', valA: 'Logistics Director (Corporate Executive)', valB: 'Licensed Customs Broker (Brokerage License CB-9921)' },
      { field: 'Corporate Affiliation', valA: 'Direct officer of Apex Marine Corp', valB: 'Explicitly declared independent agent with no corporate affiliation' }
    ],
    status: 'unresolved',
    sources: [
      { sourceId: 'src-01-surveillance', filename: 'Report_01_Customs_Surveillance.txt' },
      { sourceId: 'src-03-audit', filename: 'Report_03_Customs_Broker_Audit.txt' }
    ]
  }
];

export const INITIAL_CONTRADICTIONS: Contradiction[] = [
  {
    id: 'contra-01',
    caseId: SYNTHETIC_CASE_ID,
    title: 'Conflicting Ownership of Vehicle V-7892',
    category: 'overlapping_ownership',
    entityIds: ['ent-van-v7892', 'ent-apex-marine', 'ent-elena-rostova'],
    claimA: {
      text: 'Apex Marine Corp registered as official commercial fleet owner since April 10, 2022 (Fleet ID: APX-FLEET-04).',
      sourceFilename: 'Vehicle_Registry_PortAuthority.csv',
      segmentId: 'seg-06-1',
      date: '2022-04-10',
      pageOrRow: 'Row 2'
    },
    claimB: {
      text: 'Elena Rostova states under interview that she is the sole private owner of van V-7892 after purchasing it privately in January 2024.',
      sourceFilename: 'Report_02_Witness_Interview_Elena.txt',
      segmentId: 'seg-02-1',
      date: '2024-03-15',
      pageOrRow: 'Interview Record Q1'
    },
    comparisonRule: 'Contradictory ownership claims over identical vehicle identifier during overlapping active timeframe (January 2024 - Present).',
    status: 'flagged',
    investigatorNote: 'Requires verification whether Apex Marine leased or sold vehicle without updating title or if witness was provided falsified paperwork.'
  }
];

export const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: 'time-01',
    caseId: SYNTHETIC_CASE_ID,
    title: 'Vehicle Registration Recorded',
    description: 'Vehicle V-7892 registered under commercial fleet tag APX-FLEET-04 by Apex Marine Corp.',
    eventDate: '2022-04-10',
    discoveryDate: '2024-03-15T15:00:00Z',
    sourceId: 'src-06-registry',
    sourceFilename: 'Vehicle_Registry_PortAuthority.csv',
    pageOrRow: 'Row 2',
    entityIds: ['ent-van-v7892', 'ent-apex-marine'],
    sourceType: 'csv'
  },
  {
    id: 'time-02',
    caseId: SYNTHETIC_CASE_ID,
    title: 'Advance Wire Transfer ($240,000 USD)',
    description: 'Orion Freight Ltd executes wire transfer to Apex Marine Corp referencing Pier 4 handling.',
    eventDate: '2024-03-12',
    discoveryDate: '2024-03-15T13:00:00Z',
    sourceId: 'src-04-transactions',
    sourceFilename: 'Transactions_Harbor_Ledger.csv',
    pageOrRow: 'Row 2',
    entityIds: ['ent-orion-freight', 'ent-apex-marine'],
    sourceType: 'csv'
  },
  {
    id: 'time-03',
    caseId: SYNTHETIC_CASE_ID,
    title: 'Coordinated Phone Calls (Arun Patel & David Vance)',
    description: 'Call record exchange between Arun Patel (+1-555-0192) and David Vance (+1-555-0377).',
    eventDate: '2024-03-13 18:22:10',
    discoveryDate: '2024-03-15T14:10:00Z',
    sourceId: 'src-05-calls',
    sourceFilename: 'Call_Records_Sprint_Mar2024.csv',
    pageOrRow: 'Row 2',
    entityIds: ['ent-arun-patel', 'ent-david-vance', 'ent-phone-0192', 'ent-phone-0377'],
    sourceType: 'csv'
  },
  {
    id: 'time-04',
    caseId: SYNTHETIC_CASE_ID,
    title: 'Pier 4 Unsealed Cargo Loading',
    description: 'Surveillance observed Arun Patel loading pelican case into van V-7892 driven by courier.',
    eventDate: '2024-03-14 02:45:00',
    discoveryDate: '2024-03-15T08:12:00Z',
    sourceId: 'src-01-surveillance',
    sourceFilename: 'Report_01_Customs_Surveillance.txt',
    pageOrRow: 'Page 1, 02:45 HRS',
    entityIds: ['ent-arun-patel', 'ent-van-v7892', 'ent-pier-4'],
    sourceType: 'txt'
  },
  {
    id: 'time-05',
    caseId: SYNTHETIC_CASE_ID,
    title: 'Warehouse Sublease Wire ($195,000 USD)',
    description: 'Apex Marine transfers $195k to Harbor Holdings LLC account ACC-99014.',
    eventDate: '2024-03-14',
    discoveryDate: '2024-03-15T13:00:00Z',
    sourceId: 'src-04-transactions',
    sourceFilename: 'Transactions_Harbor_Ledger.csv',
    pageOrRow: 'Row 3',
    entityIds: ['ent-apex-marine', 'ent-harbor-holdings'],
    sourceType: 'csv'
  },
  {
    id: 'time-06',
    caseId: SYNTHETIC_CASE_ID,
    title: 'Courier Fee Wire & Interview',
    description: 'Orion Freight pays $1,200 to Elena Rostova. Witness interview conducted by Det. Vance.',
    eventDate: '2024-03-15 11:00:00',
    discoveryDate: '2024-03-15T09:40:00Z',
    sourceId: 'src-02-witness',
    sourceFilename: 'Report_02_Witness_Interview_Elena.txt',
    pageOrRow: 'Page 1',
    entityIds: ['ent-orion-freight', 'ent-elena-rostova'],
    sourceType: 'txt'
  }
];

// DEMONSTRATION INCREMENTAL EVIDENCE 1: SCANNED OCR IMAGE
// "Warehouse_Gate_Security_Photo.png"
export const DEMO_IMAGE_EVIDENCE = {
  filename: 'Warehouse_Gate_Security_Photo.png',
  fileType: 'image' as const,
  mimeType: 'image/png',
  fileSize: 48920,
  ocrText: `PORT AUTHORITY POLICE — SECURITY CHECKPOINT LOG
CAMERA: GATE 9 WAREHOUSE ACCESS | DATE: 2024-03-14 23:45:18 EST
VEHICLE DETECTED: Blue Cargo Van | PLATE: V-7892
DRIVER IDENTIFIED: Elena Rostova (Badge ID: C-8812)
PASSENGER / RECEIVER: Marcus Reed, Operations Director (Harbor Holdings LLC)
STATUS: Gate Access Granted — Terminal Bay 9-B
NOTE: Manifest #HH-449 signed by Marcus Reed. Cargo transfer into Harbor Holdings storage bay confirmed.`,
  ocrConfidence: 'high' as const,
  ocrMethod: 'deterministic_ocr' as const,
  newEntities: [
    {
      id: 'ent-marcus-reed',
      name: 'Marcus Reed',
      type: 'person' as const,
      identifiers: { role: 'Operations Director', company: 'Harbor Holdings LLC', badge: 'C-8812' }
    },
    {
      id: 'ent-gate-9',
      name: 'Terminal Gate 9 Checkpoint',
      type: 'location' as const,
      identifiers: { facility: 'Harbor Holdings Bay 9-B' }
    }
  ],
  newRelationships: [
    {
      id: 'rel-ocr-01',
      from: 'ent-elena-rostova',
      to: 'ent-marcus-reed',
      label: 'Delivered Cargo to Marcus Reed',
      relationType: 'communicated_with',
      quotation: 'Manifest #HH-449 signed by Marcus Reed. Cargo transfer into Harbor Holdings storage bay confirmed.'
    },
    {
      id: 'rel-ocr-02',
      from: 'ent-marcus-reed',
      to: 'ent-harbor-holdings',
      label: 'Operations Director',
      relationType: 'directed',
      quotation: 'Marcus Reed, Operations Director (Harbor Holdings LLC)'
    },
    {
      id: 'rel-ocr-03',
      from: 'ent-van-v7892',
      to: 'ent-gate-9',
      label: 'Security Checkpoint Ingress',
      relationType: 'co_located',
      quotation: 'VEHICLE DETECTED: Blue Cargo Van | PLATE: V-7892 at GATE 9 WAREHOUSE ACCESS'
    }
  ],
  bridgeDescription: 'Security Checkpoint Gate Photo connects Elena Rostova & Van V-7892 directly to Marcus Reed at Harbor Holdings LLC, uniting the Pier 4 network with the Harbor Holdings entity cluster.'
};

// DEMONSTRATION INCREMENTAL EVIDENCE 2: TEXT REPORT
// "Report_04_Confidential_Informant_Debrief.txt"
export const DEMO_REPORT_04 = {
  filename: 'Report_04_Confidential_Informant_Debrief.txt',
  fileType: 'txt' as const,
  mimeType: 'text/plain',
  fileSize: 3120,
  rawText: `CONFIDENTIAL INVESTIGATIVE MEMORANDUM
TO: Lead Prosecutor, Financial Crimes Division
FROM: Task Force Hunter
DATE: 2024-03-16 | CLASSIFICATION: LAW ENFORCEMENT SENSITIVE

RE: Operation Harbor Ledger — New Evidence Connecting Harbor Holdings

1. Source CI-440 confirms that David Vance (Orion Freight Ltd) met Marcus Reed (Operations Director at Harbor Holdings LLC) at the Harbor Yacht Club on March 11.
2. Vance instructed Reed that Apex Marine Corp would route $195,000 to Harbor Holdings account ACC-99014 under the pretext of 'Bay 3-B Sublease'.
3. In return, Harbor Holdings released restricted storage space in Bay 9-B to receive cargo unsealed at Pier 4.
4. CI-440 identified cell phone +1-555-0994 as Marcus Reed's direct private line.

CRITICAL DISCOVERY:
This document establishes direct collusion between David Vance (Orion Freight) and Marcus Reed (Harbor Holdings), proving the financial routing was premeditated prior to the March 14 surveillance incident.`,
  newEntities: [
    {
      id: 'ent-phone-0994',
      name: '+1-555-0994',
      type: 'phone' as const,
      identifiers: { subscriber: 'Marcus Reed' }
    }
  ],
  newRelationships: [
    {
      id: 'rel-rep4-01',
      from: 'ent-david-vance',
      to: 'ent-marcus-reed',
      label: 'Premeditated Collusion Meeting',
      relationType: 'communicated_with',
      quotation: 'David Vance (Orion Freight Ltd) met Marcus Reed (Operations Director at Harbor Holdings LLC) at the Harbor Yacht Club on March 11.'
    },
    {
      id: 'rel-rep4-02',
      from: 'ent-marcus-reed',
      to: 'ent-phone-0994',
      label: 'Private Cellular Line',
      relationType: 'operated',
      quotation: 'CI-440 identified cell phone +1-555-0994 as Marcus Reed\'s direct private line.'
    }
  ],
  bridgeDescription: 'Report 04 establishes direct personal collusion between David Vance (Orion Freight) and Marcus Reed (Harbor Holdings LLC), connecting the two previously isolated operational wings.'
};
