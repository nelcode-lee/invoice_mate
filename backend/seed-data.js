const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedData() {
    try {
        console.log('🌱 Starting database seeding for One-Man Contractor...');

        // Find the accounting user
        const user = await prisma.user.findUnique({
            where: { email: 'admin@accounting.com' }
        });

        if (!user) {
            console.log('❌ User admin@accounting.com not found. Please register first.');
            return;
        }

        console.log('✅ Found user:', user.email);

        // Create a one-man contractor company
        const company = await prisma.company.create({
            data: {
                name: 'John Smith Building Services',
                vatNumber: 'GB123456789',
                companyNumber: '12345678',
                utr: '1234567890'
            }
        });

        console.log('✅ Created contractor company:', company.name);

        // Create realistic clients for a one-man contractor
        const clients = await Promise.all([
            prisma.client.create({
                data: {
                    companyId: company.id,
                    name: 'Sarah Johnson',
                    contactPerson: 'Sarah Johnson',
                    email: 'sarah.johnson@email.com',
                    phone: '+44 117 123 4567',
                    address: '45 High Street, Bristol, BS1 1AA',
                    vatNumber: '',
                    notes: 'Homeowner - kitchen renovation'
                }
            }),
            prisma.client.create({
                data: {
                    companyId: company.id,
                    name: 'Mike & Lisa Thompson',
                    contactPerson: 'Mike Thompson',
                    email: 'mike.thompson@email.com',
                    phone: '+44 117 123 4568',
                    address: '12 Church Lane, Bath, BA1 1AA',
                    vatNumber: '',
                    notes: 'Couple - bathroom refit'
                }
            }),
            prisma.client.create({
                data: {
                    companyId: company.id,
                    name: 'David Wilson',
                    contactPerson: 'David Wilson',
                    email: 'david.wilson@email.com',
                    phone: '+44 117 123 4569',
                    address: '78 Oak Avenue, Swindon, SN1 1AA',
                    vatNumber: '',
                    notes: 'Landlord - property maintenance'
                }
            }),
            prisma.client.create({
                data: {
                    companyId: company.id,
                    name: 'Emma Green',
                    contactPerson: 'Emma Green',
                    email: 'emma.green@email.com',
                    phone: '+44 117 123 4570',
                    address: '23 Park Road, Cardiff, CF1 1AA',
                    vatNumber: '',
                    notes: 'Homeowner - garden room extension'
                }
            }),
            prisma.client.create({
                data: {
                    companyId: company.id,
                    name: 'Robert & Maria Garcia',
                    contactPerson: 'Robert Garcia',
                    email: 'robert.garcia@email.com',
                    phone: '+44 117 123 4571',
                    address: '56 Victoria Street, Bristol, BS2 1AA',
                    vatNumber: '',
                    notes: 'Family - loft conversion'
                }
            }),
            prisma.client.create({
                data: {
                    companyId: company.id,
                    name: 'Lisa Chen',
                    contactPerson: 'Lisa Chen',
                    email: 'lisa.chen@email.com',
                    phone: '+44 117 123 4572',
                    address: '34 Queens Road, Bath, BA2 1AA',
                    vatNumber: '',
                    notes: 'Homeowner - conservatory repair'
                }
            }),
            prisma.client.create({
                data: {
                    companyId: company.id,
                    name: 'James & Amanda Brown',
                    contactPerson: 'James Brown',
                    email: 'james.brown@email.com',
                    phone: '+44 117 123 4573',
                    address: '89 Hill Street, Swindon, SN2 1AA',
                    vatNumber: '',
                    notes: 'Couple - decking and fencing'
                }
            }),
            prisma.client.create({
                data: {
                    companyId: company.id,
                    name: 'Patricia O\'Connor',
                    contactPerson: 'Patricia O\'Connor',
                    email: 'patricia.oconnor@email.com',
                    phone: '+44 117 123 4574',
                    address: '67 Elm Close, Cardiff, CF2 1AA',
                    vatNumber: '',
                    notes: 'Retired homeowner - general repairs'
                }
            }),
            prisma.client.create({
                data: {
                    companyId: company.id,
                    name: 'Kevin & Rachel Davies',
                    contactPerson: 'Kevin Davies',
                    email: 'kevin.davies@email.com',
                    phone: '+44 117 123 4575',
                    address: '123 Main Street, Bristol, BS3 1AA',
                    vatNumber: '',
                    notes: 'Young family - kitchen extension'
                }
            })
        ]);

        console.log('✅ Created 9 residential clients');

        // Helper function to create realistic line items for a one-man contractor
        function createContractorLineItems(invoiceId, projectType) {
            const items = [];
            
            switch(projectType) {
                case 'kitchen_renovation':
                    items.push(
                        { description: 'Kitchen cabinet installation', quantity: 1, unitPrice: 450, vatType: 'STANDARD', vatAmount: 90, lineTotal: 540 },
                        { description: 'Worktop fitting and sealing', quantity: 1, unitPrice: 280, vatType: 'STANDARD', vatAmount: 56, lineTotal: 336 },
                        { description: 'Plumbing connections', quantity: 1, unitPrice: 120, vatType: 'STANDARD', vatAmount: 24, lineTotal: 144 },
                        { description: 'Electrical work and testing', quantity: 1, unitPrice: 180, vatType: 'STANDARD', vatAmount: 36, lineTotal: 216 },
                        { description: 'Labour and project management', quantity: 1, unitPrice: 320, vatType: 'STANDARD', vatAmount: 64, lineTotal: 384 }
                    );
                    break;
                case 'bathroom_refit':
                    items.push(
                        { description: 'Bathroom suite installation', quantity: 1, unitPrice: 380, vatType: 'STANDARD', vatAmount: 76, lineTotal: 456 },
                        { description: 'Tiling work and grouting', quantity: 1, unitPrice: 420, vatType: 'STANDARD', vatAmount: 84, lineTotal: 504 },
                        { description: 'Plumbing and drainage', quantity: 1, unitPrice: 150, vatType: 'STANDARD', vatAmount: 30, lineTotal: 180 },
                        { description: 'Electrical work (extractor fan)', quantity: 1, unitPrice: 90, vatType: 'STANDARD', vatAmount: 18, lineTotal: 108 },
                        { description: 'Labour and project management', quantity: 1, unitPrice: 280, vatType: 'STANDARD', vatAmount: 56, lineTotal: 336 }
                    );
                    break;
                case 'property_maintenance':
                    items.push(
                        { description: 'General repairs and maintenance', quantity: 1, unitPrice: 180, vatType: 'STANDARD', vatAmount: 36, lineTotal: 216 },
                        { description: 'Minor plumbing repairs', quantity: 1, unitPrice: 120, vatType: 'STANDARD', vatAmount: 24, lineTotal: 144 },
                        { description: 'Electrical safety checks', quantity: 1, unitPrice: 90, vatType: 'STANDARD', vatAmount: 18, lineTotal: 108 },
                        { description: 'Labour and call-out', quantity: 1, unitPrice: 60, vatType: 'STANDARD', vatAmount: 12, lineTotal: 72 }
                    );
                    break;
                case 'garden_room':
                    items.push(
                        { description: 'Garden room construction', quantity: 1, unitPrice: 680, vatType: 'STANDARD', vatAmount: 136, lineTotal: 816 },
                        { description: 'Foundation and base work', quantity: 1, unitPrice: 320, vatType: 'STANDARD', vatAmount: 64, lineTotal: 384 },
                        { description: 'Electrical installation', quantity: 1, unitPrice: 180, vatType: 'STANDARD', vatAmount: 36, lineTotal: 216 },
                        { description: 'Insulation and finishing', quantity: 1, unitPrice: 240, vatType: 'STANDARD', vatAmount: 48, lineTotal: 288 },
                        { description: 'Labour and project management', quantity: 1, unitPrice: 380, vatType: 'STANDARD', vatAmount: 76, lineTotal: 456 }
                    );
                    break;
                case 'loft_conversion':
                    items.push(
                        { description: 'Loft conversion structural work', quantity: 1, unitPrice: 850, vatType: 'STANDARD', vatAmount: 170, lineTotal: 1020 },
                        { description: 'Staircase installation', quantity: 1, unitPrice: 420, vatType: 'STANDARD', vatAmount: 84, lineTotal: 504 },
                        { description: 'Electrical and lighting', quantity: 1, unitPrice: 280, vatType: 'STANDARD', vatAmount: 56, lineTotal: 336 },
                        { description: 'Insulation and plastering', quantity: 1, unitPrice: 320, vatType: 'STANDARD', vatAmount: 64, lineTotal: 384 },
                        { description: 'Labour and project management', quantity: 1, unitPrice: 480, vatType: 'STANDARD', vatAmount: 96, lineTotal: 576 }
                    );
                    break;
                case 'conservatory_repair':
                    items.push(
                        { description: 'Conservatory roof repair', quantity: 1, unitPrice: 320, vatType: 'STANDARD', vatAmount: 64, lineTotal: 384 },
                        { description: 'Glazing replacement', quantity: 1, unitPrice: 180, vatType: 'STANDARD', vatAmount: 36, lineTotal: 216 },
                        { description: 'Frame repairs and sealing', quantity: 1, unitPrice: 140, vatType: 'STANDARD', vatAmount: 28, lineTotal: 168 },
                        { description: 'Labour and materials', quantity: 1, unitPrice: 120, vatType: 'STANDARD', vatAmount: 24, lineTotal: 144 }
                    );
                    break;
                case 'decking_fencing':
                    items.push(
                        { description: 'Decking construction', quantity: 1, unitPrice: 380, vatType: 'STANDARD', vatAmount: 76, lineTotal: 456 },
                        { description: 'Fencing installation', quantity: 1, unitPrice: 280, vatType: 'STANDARD', vatAmount: 56, lineTotal: 336 },
                        { description: 'Gates and hardware', quantity: 1, unitPrice: 120, vatType: 'STANDARD', vatAmount: 24, lineTotal: 144 },
                        { description: 'Labour and project management', quantity: 1, unitPrice: 200, vatType: 'STANDARD', vatAmount: 40, lineTotal: 240 }
                    );
                    break;
                case 'general_repairs':
                    items.push(
                        { description: 'General repairs and maintenance', quantity: 1, unitPrice: 150, vatType: 'STANDARD', vatAmount: 30, lineTotal: 180 },
                        { description: 'Minor carpentry work', quantity: 1, unitPrice: 90, vatType: 'STANDARD', vatAmount: 18, lineTotal: 108 },
                        { description: 'Labour and call-out', quantity: 1, unitPrice: 60, vatType: 'STANDARD', vatAmount: 12, lineTotal: 72 }
                    );
                    break;
                case 'kitchen_extension':
                    items.push(
                        { description: 'Kitchen extension construction', quantity: 1, unitPrice: 720, vatType: 'STANDARD', vatAmount: 144, lineTotal: 864 },
                        { description: 'Kitchen fitting and installation', quantity: 1, unitPrice: 480, vatType: 'STANDARD', vatAmount: 96, lineTotal: 576 },
                        { description: 'Electrical and plumbing work', quantity: 1, unitPrice: 280, vatType: 'STANDARD', vatAmount: 56, lineTotal: 336 },
                        { description: 'Labour and project management', quantity: 1, unitPrice: 420, vatType: 'STANDARD', vatAmount: 84, lineTotal: 504 }
                    );
                    break;
            }

            return items.map(item => ({
                invoiceId: invoiceId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                vatType: item.vatType,
                vatAmount: item.vatAmount,
                lineTotal: item.lineTotal
            }));
        }

        // Project types for a one-man contractor
        const projectTypes = [
            'kitchen_renovation', 'bathroom_refit', 'property_maintenance', 
            'garden_room', 'loft_conversion', 'conservatory_repair',
            'decking_fencing', 'general_repairs', 'kitchen_extension'
        ];

        // Create realistic invoices for 2023 (weekly sales £1200-£1800)
        const invoices2023 = [];
        for (let month = 1; month <= 12; month++) {
            // 2-3 invoices per month (realistic for one-man contractor)
            const invoicesThisMonth = Math.floor(Math.random() * 2) + 2;
            
            for (let i = 0; i < invoicesThisMonth; i++) {
                const client = clients[Math.floor(Math.random() * clients.length)];
                const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
                const invoiceDate = new Date(2023, month - 1, 5 + i * 10);
                const dueDate = new Date(invoiceDate);
                dueDate.setDate(dueDate.getDate() + 30);
                
                const invoice = await prisma.invoice.create({
                    data: {
                        companyId: company.id,
                        clientId: client.id,
                        invoiceDate: invoiceDate,
                        dueDate: dueDate,
                        description: `${projectType.replace('_', ' ')} - ${client.name}`,
                        subtotal: 0,
                        vat: 0,
                        total: 0,
                        status: ['PENDING', 'SENT', 'PAID'][Math.floor(Math.random() * 3)]
                    }
                });

                const lineItems = createContractorLineItems(invoice.id, projectType);
                await Promise.all(lineItems.map(item => prisma.lineItem.create({ data: item })));

                const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal - item.vatAmount, 0);
                const vat = lineItems.reduce((sum, item) => sum + item.vatAmount, 0);
                const total = subtotal + vat;

                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { subtotal, vat, total }
                });

                invoices2023.push(invoice);
            }
        }

        // Create realistic invoices for 2024
        const invoices2024 = [];
        for (let month = 1; month <= 12; month++) {
            const invoicesThisMonth = Math.floor(Math.random() * 2) + 2;
            
            for (let i = 0; i < invoicesThisMonth; i++) {
                const client = clients[Math.floor(Math.random() * clients.length)];
                const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
                const invoiceDate = new Date(2024, month - 1, 8 + i * 12);
                const dueDate = new Date(invoiceDate);
                dueDate.setDate(dueDate.getDate() + 30);
                
                const invoice = await prisma.invoice.create({
                    data: {
                        companyId: company.id,
                        clientId: client.id,
                        invoiceDate: invoiceDate,
                        dueDate: dueDate,
                        description: `${projectType.replace('_', ' ')} - ${client.name}`,
                        subtotal: 0,
                        vat: 0,
                        total: 0,
                        status: ['PENDING', 'SENT', 'PAID'][Math.floor(Math.random() * 3)]
                    }
                });

                const lineItems = createContractorLineItems(invoice.id, projectType);
                await Promise.all(lineItems.map(item => prisma.lineItem.create({ data: item })));

                const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal - item.vatAmount, 0);
                const vat = lineItems.reduce((sum, item) => sum + item.vatAmount, 0);
                const total = subtotal + vat;

                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { subtotal, vat, total }
                });

                invoices2024.push(invoice);
            }
        }

        // Create current year invoices for 2025
        const invoices2025 = [];
        for (let month = 1; month <= 8; month++) {
            const invoicesThisMonth = Math.floor(Math.random() * 2) + 2;
            
            for (let i = 0; i < invoicesThisMonth; i++) {
                const client = clients[Math.floor(Math.random() * clients.length)];
                const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
                const invoiceDate = new Date(2025, month - 1, 3 + i * 15);
                const dueDate = new Date(invoiceDate);
                dueDate.setDate(dueDate.getDate() + 30);
                
                const invoice = await prisma.invoice.create({
                    data: {
                        companyId: company.id,
                        clientId: client.id,
                        invoiceDate: invoiceDate,
                        dueDate: dueDate,
                        description: `${projectType.replace('_', ' ')} - ${client.name}`,
                        subtotal: 0,
                        vat: 0,
                        total: 0,
                        status: ['PENDING', 'SENT', 'PAID', 'OVERDUE'][Math.floor(Math.random() * 4)]
                    }
                });

                const lineItems = createContractorLineItems(invoice.id, projectType);
                await Promise.all(lineItems.map(item => prisma.lineItem.create({ data: item })));

                const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal - item.vatAmount, 0);
                const vat = lineItems.reduce((sum, item) => sum + item.vatAmount, 0);
                const total = subtotal + vat;

                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { subtotal, vat, total }
                });

                invoices2025.push(invoice);
            }
        }

        console.log('✅ Created realistic contractor invoices');

        // Create realistic expenses for a one-man contractor
        const expenseCategories = [
            'Mileage', 'Subsistence', 'Tools and Equipment', 'Materials', 
            'Vehicle Costs', 'Insurance', 'Training', 'Office Supplies'
        ];

        const expenses2023 = [];
        for (let month = 1; month <= 12; month++) {
            // 8-12 expenses per month (realistic for contractor)
            const expensesThisMonth = Math.floor(Math.random() * 5) + 8;
            
            for (let i = 0; i < expensesThisMonth; i++) {
                const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
                let amount, description;
                
                switch(category) {
                    case 'Mileage':
                        const miles = Math.floor(Math.random() * 800) + 200; // 200-1000 miles
                        amount = miles * 0.45; // 45p per mile
                        description = `${miles} miles - client visits and site work`;
                        break;
                    case 'Subsistence':
                        amount = Math.floor(Math.random() * 15) + 8; // £8-£23 per day
                        description = 'Lunch and refreshments on site';
                        break;
                    case 'Tools and Equipment':
                        amount = Math.floor(Math.random() * 80) + 20; // £20-£100
                        description = 'Hand tools, power tools, safety equipment';
                        break;
                    case 'Materials':
                        amount = Math.floor(Math.random() * 150) + 50; // £50-£200
                        description = 'Building materials, screws, fixings';
                        break;
                    case 'Vehicle Costs':
                        amount = Math.floor(Math.random() * 100) + 30; // £30-£130
                        description = 'Fuel, maintenance, van insurance';
                        break;
                    case 'Insurance':
                        amount = Math.floor(Math.random() * 50) + 20; // £20-£70
                        description = 'Public liability, tools insurance';
                        break;
                    case 'Training':
                        amount = Math.floor(Math.random() * 120) + 40; // £40-£160
                        description = 'Safety courses, trade training';
                        break;
                    case 'Office Supplies':
                        amount = Math.floor(Math.random() * 30) + 10; // £10-£40
                        description = 'Paper, ink, stationery';
                        break;
                }

                const expense = await prisma.expense.create({
                    data: {
                        companyId: company.id,
                        date: new Date(2023, month - 1, 5 + i * 3),
                        amount: amount,
                        category: category,
                        description: description,
                        receiptUrl: '',
                        mileage: category === 'Mileage' ? Math.floor(Math.random() * 800) + 200 : null,
                        vehicleType: category === 'Vehicle Costs' ? 'Van' : null
                    }
                });
                expenses2023.push(expense);
            }
        }

        // Create expenses for 2024
        const expenses2024 = [];
        for (let month = 1; month <= 12; month++) {
            const expensesThisMonth = Math.floor(Math.random() * 5) + 8;
            
            for (let i = 0; i < expensesThisMonth; i++) {
                const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
                let amount, description;
                
                switch(category) {
                    case 'Mileage':
                        const miles = Math.floor(Math.random() * 800) + 200;
                        amount = miles * 0.45;
                        description = `${miles} miles - client visits and site work`;
                        break;
                    case 'Subsistence':
                        amount = Math.floor(Math.random() * 15) + 8;
                        description = 'Lunch and refreshments on site';
                        break;
                    case 'Tools and Equipment':
                        amount = Math.floor(Math.random() * 80) + 20;
                        description = 'Hand tools, power tools, safety equipment';
                        break;
                    case 'Materials':
                        amount = Math.floor(Math.random() * 150) + 50;
                        description = 'Building materials, screws, fixings';
                        break;
                    case 'Vehicle Costs':
                        amount = Math.floor(Math.random() * 100) + 30;
                        description = 'Fuel, maintenance, van insurance';
                        break;
                    case 'Insurance':
                        amount = Math.floor(Math.random() * 50) + 20;
                        description = 'Public liability, tools insurance';
                        break;
                    case 'Training':
                        amount = Math.floor(Math.random() * 120) + 40;
                        description = 'Safety courses, trade training';
                        break;
                    case 'Office Supplies':
                        amount = Math.floor(Math.random() * 30) + 10;
                        description = 'Paper, ink, stationery';
                        break;
                }

                const expense = await prisma.expense.create({
                    data: {
                        companyId: company.id,
                        date: new Date(2024, month - 1, 8 + i * 3),
                        amount: amount,
                        category: category,
                        description: description,
                        receiptUrl: '',
                        mileage: category === 'Mileage' ? Math.floor(Math.random() * 800) + 200 : null,
                        vehicleType: category === 'Vehicle Costs' ? 'Van' : null
                    }
                });
                expenses2024.push(expense);
            }
        }

        // Create expenses for 2025
        const expenses2025 = [];
        for (let month = 1; month <= 8; month++) {
            const expensesThisMonth = Math.floor(Math.random() * 5) + 8;
            
            for (let i = 0; i < expensesThisMonth; i++) {
                const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
                let amount, description;
                
                switch(category) {
                    case 'Mileage':
                        const miles = Math.floor(Math.random() * 800) + 200;
                        amount = miles * 0.45;
                        description = `${miles} miles - client visits and site work`;
                        break;
                    case 'Subsistence':
                        amount = Math.floor(Math.random() * 15) + 8;
                        description = 'Lunch and refreshments on site';
                        break;
                    case 'Tools and Equipment':
                        amount = Math.floor(Math.random() * 80) + 20;
                        description = 'Hand tools, power tools, safety equipment';
                        break;
                    case 'Materials':
                        amount = Math.floor(Math.random() * 150) + 50;
                        description = 'Building materials, screws, fixings';
                        break;
                    case 'Vehicle Costs':
                        amount = Math.floor(Math.random() * 100) + 30;
                        description = 'Fuel, maintenance, van insurance';
                        break;
                    case 'Insurance':
                        amount = Math.floor(Math.random() * 50) + 20;
                        description = 'Public liability, tools insurance';
                        break;
                    case 'Training':
                        amount = Math.floor(Math.random() * 120) + 40;
                        description = 'Safety courses, trade training';
                        break;
                    case 'Office Supplies':
                        amount = Math.floor(Math.random() * 30) + 10;
                        description = 'Paper, ink, stationery';
                        break;
                }

                const expense = await prisma.expense.create({
                    data: {
                        companyId: company.id,
                        date: new Date(2025, month - 1, 3 + i * 3),
                        amount: amount,
                        category: category,
                        description: description,
                        receiptUrl: '',
                        mileage: category === 'Mileage' ? Math.floor(Math.random() * 800) + 200 : null,
                        vehicleType: category === 'Vehicle Costs' ? 'Van' : null
                    }
                });
                expenses2025.push(expense);
            }
        }

        console.log('✅ Created realistic contractor expenses');

        // Create settings for the contractor
        const settings = await Promise.all([
            prisma.setting.create({
                data: {
                    companyId: company.id,
                    key: "default_vat_rate",
                    value: "20"
                }
            }),
            prisma.setting.create({
                data: {
                    companyId: company.id,
                    key: "invoice_prefix",
                    value: "JSB"
                }
            }),
            prisma.setting.create({
                data: {
                    companyId: company.id,
                    key: "payment_terms",
                    value: "30"
                }
            }),
            prisma.setting.create({
                data: {
                    companyId: company.id,
                    key: "currency",
                    value: "GBP"
                }
            }),
            prisma.setting.create({
                data: {
                    companyId: company.id,
                    key: "mileage_rate",
                    value: "0.45"
                }
            }),
            prisma.setting.create({
                data: {
                    companyId: company.id,
                    key: "company_address",
                    value: "123 Builder Street, Bristol, BS1 1AA"
                }
            }),
            prisma.setting.create({
                data: {
                    companyId: company.id,
                    key: "company_phone",
                    value: "+44 117 123 4567"
                }
            }),
            prisma.setting.create({
                data: {
                    companyId: company.id,
                    key: "company_email",
                    value: "john@smithbuildingservices.com"
                }
            })
        ]);

        console.log('✅ Created 8 company settings');

        console.log('🎉 Database seeding completed successfully!');
        console.log('📊 Summary:');
        console.log(`   • Company: ${company.name}`);
        console.log(`   • Clients: ${clients.length}`);
        console.log(`   • 2023 Invoices: ${invoices2023.length}`);
        console.log(`   • 2024 Invoices: ${invoices2024.length}`);
        console.log(`   • 2025 Invoices: ${invoices2025.length}`);
        console.log(`   • 2023 Expenses: ${expenses2023.length}`);
        console.log(`   • 2024 Expenses: ${expenses2024.length}`);
        console.log(`   • 2025 Expenses: ${expenses2025.length}`);
        console.log(`   • Settings: ${settings.length}`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedData(); 