// Pharmacy Management System - Data Layer & Seeding (Updated with Advanced Features)
// Current System Date simulation: 2026-06-29

const DEFAULT_USERS = [
  {
    "userId": "usr_admin",
    "name": "عبدالرحمٰن (ایڈمن)",
    "username": "admin",
    "password": "123",
    "role": "Admin",
    "status": "Active"
  },
  {
    "userId": "usr_pharmacist",
    "name": "سارہ علی (فارماسسٹ)",
    "username": "pharmacist",
    "password": "123",
    "role": "Pharmacist",
    "status": "Active"
  },
  {
    "userId": "usr_cashier",
    "name": "احمد خان (کیشیئر)",
    "username": "cashier",
    "password": "123",
    "role": "Cashier",
    "status": "Active"
  }
];

const DEFAULT_INVENTORY = [
  {
    "medicineId": "med_1",
    "name": "Panadol 500mg",
    "brand": "GSK",
    "formula": "Paracetamol",
    "category": "Analgesic",
    "barcode": "8961012345678",
    "defaultSupplierId": "sup_1",
    "packaging": {
      "stripsPerBox": 10,
      "tabletsPerStrip": 10,
      "totalTabletsPerBox": 100
    },
    "pricing": {
      "costPerTablet": 1.20,
      "retailPerTablet": 1.50,
      "retailPerStrip": 15.00,
      "retailPerBox": 140.00
    },
    "batches": [
      {
        "batchNumber": "B-PND101",
        "purchasePrice": 1.2,
        "retailPrice": 1.5,
        "quantity": 120,
        "expiryDate": "2027-12-31",
        "receivedDate": "2026-05-01"
      },
      {
        "batchNumber": "B-PND102",
        "purchasePrice": 1.25,
        "retailPrice": 1.50,
        "quantity": 30,
        "expiryDate": "2026-07-15",
        "receivedDate": "2026-06-20"
      }
    ],
    "reorderLevel": 200,
    "totalQuantity": 150,
    "rackLocation": "A-3",
    "prescriptionRequired": false
  },
  {
    "medicineId": "med_5",
    "name": "Calpol 500mg",
    "brand": "GSK",
    "formula": "Paracetamol",
    "category": "Analgesic",
    "barcode": "8961012345710",
    "defaultSupplierId": "sup_1",
    "packaging": {
      "stripsPerBox": 10,
      "tabletsPerStrip": 10,
      "totalTabletsPerBox": 100
    },
    "pricing": {
      "costPerTablet": 1.15,
      "retailPerTablet": 1.45,
      "retailPerStrip": 14.50,
      "retailPerBox": 135.00
    },
    "batches": [
      {
        "batchNumber": "B-CAL01",
        "purchasePrice": 1.15,
        "retailPrice": 1.45,
        "quantity": 250,
        "expiryDate": "2027-09-30",
        "receivedDate": "2026-06-01"
      }
    ],
    "reorderLevel": 100,
    "totalQuantity": 250,
    "rackLocation": "A-4",
    "prescriptionRequired": false
  },
  {
    "medicineId": "med_6",
    "name": "Disprol 500mg",
    "brand": "Reckitt Benckiser",
    "formula": "Paracetamol",
    "category": "Analgesic",
    "barcode": "8961012345720",
    "defaultSupplierId": "sup_1",
    "packaging": {
      "stripsPerBox": 10,
      "tabletsPerStrip": 10,
      "totalTabletsPerBox": 100
    },
    "pricing": {
      "costPerTablet": 1.10,
      "retailPerTablet": 1.40,
      "retailPerStrip": 14.00,
      "retailPerBox": 130.00
    },
    "batches": [
      {
        "batchNumber": "B-DIS01",
        "purchasePrice": 1.10,
        "retailPrice": 1.40,
        "quantity": 300,
        "expiryDate": "2027-11-30",
        "receivedDate": "2026-05-15"
      }
    ],
    "reorderLevel": 100,
    "totalQuantity": 300,
    "rackLocation": "A-5",
    "prescriptionRequired": false
  },
  {
    "medicineId": "med_2",
    "name": "Amoxil 250mg",
    "brand": "GSK",
    "formula": "Amoxicillin",
    "category": "Antibiotic",
    "barcode": "8961012345689",
    "defaultSupplierId": "sup_1",
    "packaging": {
      "stripsPerBox": 10,
      "tabletsPerStrip": 10,
      "totalTabletsPerBox": 100
    },
    "pricing": {
      "costPerTablet": 12.00,
      "retailPerTablet": 15.00,
      "retailPerStrip": 150.00,
      "retailPerBox": 1400.00
    },
    "batches": [
      {
        "batchNumber": "B-AMX99",
        "purchasePrice": 12.0,
        "retailPrice": 15.0,
        "quantity": 80,
        "expiryDate": "2026-09-30",
        "receivedDate": "2026-04-10"
      }
    ],
    "reorderLevel": 50,
    "totalQuantity": 80,
    "rackLocation": "B-1",
    "prescriptionRequired": true
  },
  {
    "medicineId": "med_3",
    "name": "Augmentin 375mg",
    "brand": "GSK",
    "formula": "Co-amoxiclav",
    "category": "Antibiotic",
    "barcode": "8961012345690",
    "defaultSupplierId": "sup_1",
    "packaging": {
      "stripsPerBox": 6,
      "tabletsPerStrip": 6,
      "totalTabletsPerBox": 36
    },
    "pricing": {
      "costPerTablet": 25.00,
      "retailPerTablet": 30.00,
      "retailPerStrip": 180.00,
      "retailPerBox": 1000.00
    },
    "batches": [
      {
        "batchNumber": "B-AUG01",
        "purchasePrice": 25.0,
        "retailPrice": 30.0,
        "quantity": 10,
        "expiryDate": "2026-05-15",
        "receivedDate": "2026-03-01"
      }
    ],
    "reorderLevel": 15,
    "totalQuantity": 10,
    "rackLocation": "B-2",
    "prescriptionRequired": true
  },
  {
    "medicineId": "med_7",
    "name": "Clamoxin 375mg",
    "brand": "Bosch Pharmaceuticals",
    "formula": "Co-amoxiclav",
    "category": "Antibiotic",
    "barcode": "8961012345730",
    "defaultSupplierId": "sup_1",
    "packaging": {
      "stripsPerBox": 6,
      "tabletsPerStrip": 6,
      "totalTabletsPerBox": 36
    },
    "pricing": {
      "costPerTablet": 22.00,
      "retailPerTablet": 27.00,
      "retailPerStrip": 162.00,
      "retailPerBox": 900.00
    },
    "batches": [
      {
        "batchNumber": "B-CLAM01",
        "purchasePrice": 22.0,
        "retailPrice": 27.0,
        "quantity": 120,
        "expiryDate": "2028-04-30",
        "receivedDate": "2026-06-01"
      }
    ],
    "reorderLevel": 20,
    "totalQuantity": 120,
    "rackLocation": "B-3",
    "prescriptionRequired": true
  },
  {
    "medicineId": "med_8",
    "name": "Risek 40mg",
    "brand": "Getz Pharma",
    "formula": "Esomeprazole",
    "category": "Gastroenterology",
    "barcode": "8961012345740",
    "defaultSupplierId": "sup_2",
    "packaging": {
      "stripsPerBox": 2,
      "tabletsPerStrip": 7,
      "totalTabletsPerBox": 14
    },
    "pricing": {
      "costPerTablet": 32.00,
      "retailPerTablet": 40.00,
      "retailPerStrip": 280.00,
      "retailPerBox": 550.00
    },
    "batches": [
      {
        "batchNumber": "B-RIS01",
        "purchasePrice": 32.0,
        "retailPrice": 40.0,
        "quantity": 280,
        "expiryDate": "2028-06-30",
        "receivedDate": "2026-06-10"
      }
    ],
    "reorderLevel": 50,
    "totalQuantity": 280,
    "rackLocation": "C-1",
    "prescriptionRequired": false
  },
  {
    "medicineId": "med_9",
    "name": "Nexum 40mg",
    "brand": "GSK",
    "formula": "Esomeprazole",
    "category": "Gastroenterology",
    "barcode": "8961012345750",
    "defaultSupplierId": "sup_1",
    "packaging": {
      "stripsPerBox": 2,
      "tabletsPerStrip": 7,
      "totalTabletsPerBox": 14
    },
    "pricing": {
      "costPerTablet": 35.00,
      "retailPerTablet": 44.00,
      "retailPerStrip": 308.00,
      "retailPerBox": 600.00
    },
    "batches": [
      {
        "batchNumber": "B-NEX01",
        "purchasePrice": 35.0,
        "retailPrice": 44.0,
        "quantity": 140,
        "expiryDate": "2028-03-31",
        "receivedDate": "2026-05-20"
      }
    ],
    "reorderLevel": 30,
    "totalQuantity": 140,
    "rackLocation": "C-2",
    "prescriptionRequired": false
  },
  {
    "medicineId": "med_10",
    "name": "Esodax 40mg",
    "brand": "Hilton Pharma",
    "formula": "Esomeprazole",
    "category": "Gastroenterology",
    "barcode": "8961012345760",
    "defaultSupplierId": "sup_2",
    "packaging": {
      "stripsPerBox": 2,
      "tabletsPerStrip": 7,
      "totalTabletsPerBox": 14
    },
    "pricing": {
      "costPerTablet": 30.00,
      "retailPerTablet": 38.00,
      "retailPerStrip": 266.00,
      "retailPerBox": 500.00
    },
    "batches": [
      {
        "batchNumber": "B-ESD01",
        "purchasePrice": 30.0,
        "retailPrice": 38.0,
        "quantity": 70,
        "expiryDate": "2027-10-31",
        "receivedDate": "2026-06-15"
      }
    ],
    "reorderLevel": 40,
    "totalQuantity": 70,
    "rackLocation": "C-3",
    "prescriptionRequired": false
  },
  {
    "medicineId": "med_4",
    "name": "Arinac Forte",
    "brand": "Abbott",
    "formula": "Ibuprofen / Pseudoephedrine",
    "category": "Antihistamine",
    "barcode": "8961012345699",
    "defaultSupplierId": "sup_2",
    "packaging": {
      "stripsPerBox": 10,
      "tabletsPerStrip": 10,
      "totalTabletsPerBox": 100
    },
    "pricing": {
      "costPerTablet": 4.50,
      "retailPerTablet": 6.00,
      "retailPerStrip": 60.00,
      "retailPerBox": 550.00
    },
    "batches": [
      {
        "batchNumber": "B-ARI77",
        "purchasePrice": 4.5,
        "retailPrice": 6.0,
        "quantity": 300,
        "expiryDate": "2028-01-10",
        "receivedDate": "2026-06-01"
      }
    ],
    "reorderLevel": 100,
    "totalQuantity": 300,
    "rackLocation": "A-1",
    "prescriptionRequired": false
  },
  {
    "medicineId": "med_11",
    "name": "Brufen 400mg",
    "brand": "Abbott",
    "formula": "Ibuprofen",
    "category": "Analgesic",
    "barcode": "8961012345770",
    "defaultSupplierId": "sup_2",
    "packaging": {
      "stripsPerBox": 3,
      "tabletsPerStrip": 10,
      "totalTabletsPerBox": 30
    },
    "pricing": {
      "costPerTablet": 6.00,
      "retailPerTablet": 7.50,
      "retailPerStrip": 75.00,
      "retailPerBox": 220.00
    },
    "batches": [
      {
        "batchNumber": "B-BRU01",
        "purchasePrice": 6.0,
        "retailPrice": 7.5,
        "quantity": 450,
        "expiryDate": "2028-07-31",
        "receivedDate": "2026-06-01"
      }
    ],
    "reorderLevel": 150,
    "totalQuantity": 450,
    "rackLocation": "A-2",
    "prescriptionRequired": false
  }
];

const DEFAULT_SUPPLIERS = [
  {
    "supplierId": "sup_1",
    "companyName": "Al-Shifa Distributors",
    "contactPerson": "محمد عثمان",
    "phone": "+92 321 4567890",
    "email": "info@alshifa.com",
    "address": "لاہور، پاکستان",
    "outstandingBalance": 45000.0
  },
  {
    "supplierId": "sup_2",
    "companyName": "Karamat Meds",
    "contactPerson": "طارق محمود",
    "phone": "+92 300 7654321",
    "email": "contact@karamatmeds.com",
    "address": "کراچی، پاکستان",
    "outstandingBalance": 12500.0
  }
];

const DEFAULT_CUSTOMERS = [
  {
    "customerId": "cust_1",
    "name": "کامران خان",
    "phone": "+92 300 1234567",
    "address": "اقبال ٹاؤن، لاہور",
    "creditLimit": 20000.0,
    "currentOutstanding": 6500.0,
    "category": "Chronic Patient", // Gets 5% discount automatically
    "status": "Active",
    "ledger": [
      {
        "transactionId": "txn_k_1",
        "timestamp": "2026-06-20T10:30:00Z",
        "type": "Debit",
        "amount": 8000.0,
        "referenceInvoice": "INV-20260620-09",
        "description": "ادھار پر شوگر ادویات کی خریداری",
        "performedBy": "usr_cashier"
      },
      {
        "transactionId": "txn_k_2",
        "timestamp": "2026-06-25T17:45:00Z",
        "type": "Credit",
        "amount": 1500.0,
        "referenceInvoice": "REC-7721",
        "description": "نقد رقم کی جزوی ادائیگی وصول ہوئی",
        "performedBy": "usr_cashier"
      }
    ]
  },
  {
    "customerId": "cust_2",
    "name": "ساجد محمود (ڈاکٹر)",
    "phone": "+92 321 9876543",
    "address": "جناح ہسپتال روڈ، لاہور",
    "creditLimit": 50000.0,
    "currentOutstanding": 0.0,
    "category": "Doctor/Clinic", // Gets 12% discount automatically
    "status": "Active",
    "ledger": []
  }
];

const DEFAULT_SALES = [
  {
    "saleId": "sal_1",
    "invoiceNumber": "INV-20260629-001",
    "timestamp": "2026-06-29T14:30:00Z",
    "cashierId": "usr_cashier",
    "items": [
      {
        "medicineId": "med_1",
        "batchNumber": "B-PND101",
        "quantity": 10, // sold in tablets
        "unit": "Tablet",
        "unitPrice": 1.5,
        "costPrice": 1.2,
        "subtotal": 15.0
      },
      {
        "medicineId": "med_2",
        "batchNumber": "B-AMX99",
        "quantity": 2,
        "unit": "Tablet",
        "unitPrice": 15.0,
        "costPrice": 12.0,
        "subtotal": 30.0
      }
    ],
    "totals": {
      "subtotal": 45.0,
      "discount": 5.0,
      "tax": 6.0, // 15% GST on (Subtotal - Discount)
      "grandTotal": 46.0,
      "totalCost": 36.0,
      "netProfit": 10.0
    },
    "payment": {
      "method": "Cash",
      "amountPaid": 50.0,
      "changeReturned": 4.0
    },
    "customer": {
      "name": "Walk-in Customer",
      "phone": ""
    }
  }
];

const DEFAULT_LEDGER = [
  {
    "ledgerId": "led_1",
    "timestamp": "2026-06-29T14:30:00Z",
    "type": "Inflow",
    "category": "Sale",
    "amount": 46.0,
    "referenceId": "sal_1",
    "description": "سیل انوائس INV-20260629-001",
    "performedBy": "usr_cashier"
  }
];

const DEFAULT_PURCHASES = [
  {
    "purchaseId": "pur_1",
    "supplierId": "sup_1",
    "invoiceNumber": "SUP-INV-8871",
    "purchaseDate": "2026-06-01T10:00:00Z",
    "items": [
      {
        "medicineId": "med_4",
        "batchNumber": "B-ARI77",
        "quantity": 300,
        "purchasePrice": 4.5,
        "expiryDate": "2028-01-10"
      }
    ],
    "totals": {
      "grandTotal": 1350.0,
      "amountPaid": 1350.0,
      "balanceDue": 0.0
    },
    "status": "Paid"
  }
];

const db = {
  get(key, defaultValue) {
    const data = localStorage.getItem(`pms_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  },
  set(key, value) {
    localStorage.setItem(`pms_${key}`, JSON.stringify(value));
  },
  init() {
    if (!localStorage.getItem('pms_users')) this.set('users', DEFAULT_USERS);
    if (!localStorage.getItem('pms_inventory')) this.set('inventory', DEFAULT_INVENTORY);
    if (!localStorage.getItem('pms_suppliers')) this.set('suppliers', DEFAULT_SUPPLIERS);
    if (!localStorage.getItem('pms_customers')) this.set('customers', DEFAULT_CUSTOMERS);
    if (!localStorage.getItem('pms_sales')) this.set('sales', DEFAULT_SALES);
    if (!localStorage.getItem('pms_ledger')) this.set('ledger', DEFAULT_LEDGER);
    if (!localStorage.getItem('pms_purchases')) this.set('purchases', DEFAULT_PURCHASES);
  },
  reset() {
    localStorage.removeItem('pms_users');
    localStorage.removeItem('pms_inventory');
    localStorage.removeItem('pms_suppliers');
    localStorage.removeItem('pms_customers');
    localStorage.removeItem('pms_sales');
    localStorage.removeItem('pms_ledger');
    localStorage.removeItem('pms_purchases');
    this.init();
  }
};

db.init();
window.PMS_DB = db;
