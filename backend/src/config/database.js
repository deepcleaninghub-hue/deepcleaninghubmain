const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema initialization
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database schema...');

    // Create services table
    const { error: servicesError } = await supabase.rpc('create_services_table');
    if (servicesError && !servicesError.message.includes('already exists')) {
      console.log('Creating services table...');
      await supabase.rpc('create_services_table');
    }

    // Create inquiries table
    const { error: inquiriesError } = await supabase.rpc('create_inquiries_table');
    if (inquiriesError && !inquiriesError.message.includes('already exists')) {
      console.log('Creating inquiries table...');
      await supabase.rpc('create_inquiries_table');
    }

    // Create blogs table
    const { error: blogsError } = await supabase.rpc('create_blogs_table');
    if (blogsError && !blogsError.message.includes('already exists')) {
      console.log('Creating blogs table...');
      await supabase.rpc('create_blogs_table');
    }

    // Create admin users table
    const { error: adminError } = await supabase.rpc('create_admin_users_table');
    if (adminError && !adminError.message.includes('already exists')) {
      console.log('Creating admin users table...');
      await supabase.rpc('create_admin_users_table');
    }

    // Create service options table
    const { error: serviceOptionsError } = await supabase.rpc('create_service_options_table');
    if (serviceOptionsError && !serviceOptionsError.message.includes('already exists')) {
      console.log('Creating service options table...');
      await supabase.rpc('create_service_options_table');
    }

    // Insert default services if they don't exist
    await insertDefaultServices();
    
    // Insert default service options
    await insertDefaultServiceOptions();
    
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
};

// Insert default services
const insertDefaultServices = async () => {
  const defaultServices = [
    {
      id: 'kitchen-cleaning',
      title: 'Kitchen Deep Cleaning',
      description: 'Thorough cleaning of your kitchen including appliances, cabinets, and surfaces for a spotless cooking environment.',
      image: 'https://deepcleaninghub.com/wp-content/uploads/2025/08/man-cleaning-cabinet-with-rag-1-2048x1363-1.jpg',
      category: 'Cleaning',
      price: 'From €80',
      duration: '2-4 hours',
      features: ['Appliance cleaning', 'Cabinet cleaning', 'Surface sanitization', 'Grease removal'],
      is_active: true
    },
    {
      id: 'house-moving',
      title: 'House Moving',
      description: 'Professional moving services to help you relocate your home with care and efficiency.',
      image: 'https://deepcleaninghub.com/wp-content/uploads/2025/08/puls-furnture-assembly-services-included-1024x684-1-1.webp',
      category: 'Moving',
      pricing_type: 'per_unit',
      unit_measure: 'm²',
      duration: '4-8 hours',
      features: ['Furniture disassembly', 'Safe packing', 'Transportation', 'Reassembly'],
      is_active: true
    },
    {
      id: 'office-moving',
      title: 'Office Moving',
      description: 'Professional office relocation services for businesses of all sizes with specialized equipment handling.',
      image: 'https://deepcleaninghub.com/wp-content/uploads/2025/08/puls-furnture-assembly-services-included-1024x684-1-1.webp',
      category: 'Moving',
      pricing_type: 'per_unit',
      unit_measure: 'items',
      duration: '6-12 hours',
      features: ['Office furniture', 'IT equipment', 'Filing systems', 'Specialized handling'],
      is_active: true
    },
    {
      id: 'deep-cleaning',
      title: 'Deep Cleaning',
      description: 'Comprehensive deep cleaning services for homes, hotels, and commercial spaces.',
      image: 'https://deepcleaninghub.com/wp-content/uploads/2025/08/shutterstock_1628546512-1.jpg',
      category: 'Cleaning',
      price: 'From €120',
      duration: '4-6 hours',
      features: ['Complete home cleaning', 'Sanitization', 'Odor removal', 'Stain treatment'],
      is_active: true
    },
    {
      id: 'furniture-assembly',
      title: 'Furniture Assembly',
      description: 'Expert furniture assembly services for all your home and office furniture needs.',
      image: 'https://deepcleaninghub.com/wp-content/uploads/2025/08/puls-furnture-assembly-services-included-1024x684-1.webp',
      category: 'Assembly',
      price: 'From €60',
      duration: '1-3 hours',
      features: ['IKEA furniture', 'Office furniture', 'Bed assembly', 'Warranty included'],
      is_active: true
    },
    {
      id: 'carpet-cleaning',
      title: 'Carpet & Upholstery Cleaning',
      description: 'Professional deep cleaning for carpets, rugs, and upholstered furniture.',
      image: 'https://deepcleaninghub.com/wp-content/uploads/2025/08/shutterstock_1628546512-1.jpg',
      category: 'Cleaning',
      price: 'From €40',
      duration: '2-3 hours',
      features: ['Stain removal', 'Deep cleaning', 'Odor elimination', 'Protection treatment'],
      is_active: true
    },
    {
      id: 'window-cleaning',
      title: 'Window & Glass Cleaning',
      description: 'Crystal clear windows and glass surfaces for a brighter, cleaner home.',
      image: 'https://deepcleaninghub.com/wp-content/uploads/2025/08/man-cleaning-cabinet-with-rag-1-2048x1363-1.jpg',
      category: 'Cleaning',
      price: 'From €30',
      duration: '1-2 hours',
      features: ['Interior & exterior', 'Frame cleaning', 'Screen cleaning', 'Streak-free finish'],
      is_active: true
    }
  ];

  try {
    for (const service of defaultServices) {
      const { error } = await supabase
        .from('services')
        .upsert(service, { onConflict: 'id' });
      
      if (error) {
        console.log(`Service ${service.id} already exists or error:`, error.message);
      }
    }
    console.log('✅ Default services inserted/updated');
  } catch (error) {
    console.log('Note: Services table might not exist yet or services already exist');
  }
};

// Insert default service options
const insertDefaultServiceOptions = async () => {
  const defaultServiceOptions = [
    // Kitchen Cleaning Options
    {
      id: 'kitchen-basic-clean',
      title: 'Basic Kitchen Clean',
      description: 'Standard kitchen cleaning including countertops, sink, and appliances',
      service_id: 'kitchen-cleaning',
      price: 80,
      duration: '2-3 hours',
      features: ['Countertop cleaning', 'Sink sanitization', 'Appliance exterior cleaning'],
      is_active: true
    },
    {
      id: 'kitchen-deep-clean',
      title: 'Deep Kitchen Clean',
      description: 'Comprehensive kitchen cleaning including inside appliances and detailed scrubbing',
      service_id: 'kitchen-cleaning',
      price: 120,
      duration: '3-4 hours',
      features: ['Inside appliance cleaning', 'Cabinet interior cleaning', 'Deep grease removal', 'Grout cleaning'],
      is_active: true
    },
    {
      id: 'kitchen-premium-clean',
      title: 'Premium Kitchen Clean',
      description: 'Complete kitchen transformation with all surfaces, appliances, and storage areas',
      service_id: 'kitchen-cleaning',
      price: 180,
      duration: '4-6 hours',
      features: ['Complete appliance cleaning', 'Cabinet organization', 'Pantry cleaning', 'Backsplash deep clean'],
      is_active: true
    },
    
    // Deep Cleaning Options
    {
      id: 'deep-clean-1bed',
      title: '1 Bedroom Deep Clean',
      description: 'Complete deep cleaning for 1 bedroom apartment',
      service_id: 'deep-cleaning',
      price: 120,
      duration: '4-5 hours',
      features: ['All rooms', 'Bathroom deep clean', 'Kitchen deep clean', 'Living area'],
      is_active: true
    },
    {
      id: 'deep-clean-2bed',
      title: '2 Bedroom Deep Clean',
      description: 'Complete deep cleaning for 2 bedroom apartment',
      service_id: 'deep-cleaning',
      price: 180,
      duration: '6-8 hours',
      features: ['All rooms', 'Multiple bathrooms', 'Kitchen deep clean', 'Living areas'],
      is_active: true
    },
    {
      id: 'deep-clean-3bed',
      title: '3+ Bedroom Deep Clean',
      description: 'Complete deep cleaning for 3+ bedroom home',
      service_id: 'deep-cleaning',
      price: 250,
      duration: '8-10 hours',
      features: ['All rooms', 'Multiple bathrooms', 'Kitchen deep clean', 'Living areas', 'Basement/Attic'],
      is_active: true
    },
    
    // House Moving Options
    {
      id: 'house-moving-with-lift',
      title: 'House Moving (With Lift)',
      description: 'Professional moving service with elevator access - €20/m²',
      service_id: 'house-moving',
      pricing_type: 'per_unit',
      unit_price: 20,
      unit_measure: 'm²',
      min_measurement: 10,
      max_measurement: 500,
      measurement_step: 1,
      measurement_placeholder: 'Enter area in m²',
      duration: '4-8 hours',
      features: ['Furniture disassembly', 'Safe packing', 'Transportation', 'Reassembly', 'Elevator access'],
      is_active: true
    },
    {
      id: 'house-moving-without-lift',
      title: 'House Moving (Without Lift/Stairs)',
      description: 'Professional moving service without elevator - €23/m²',
      service_id: 'house-moving',
      pricing_type: 'per_unit',
      unit_price: 23,
      unit_measure: 'm²',
      min_measurement: 10,
      max_measurement: 500,
      measurement_step: 1,
      measurement_placeholder: 'Enter area in m²',
      duration: '4-8 hours',
      features: ['Furniture disassembly', 'Safe packing', 'Transportation', 'Reassembly', 'Stair handling'],
      is_active: true
    },
    
    // Office Moving Options
    {
      id: 'office-moving-with-lift',
      title: 'Office Moving (With Lift)',
      description: 'Professional office moving service with elevator access - €90/item',
      service_id: 'office-moving',
      pricing_type: 'per_unit',
      unit_price: 90,
      unit_measure: 'items',
      min_measurement: 1,
      max_measurement: 100,
      measurement_step: 1,
      measurement_placeholder: 'Enter number of items',
      duration: '6-12 hours',
      features: ['Office furniture', 'IT equipment', 'Filing systems', 'Elevator access', 'Specialized handling'],
      is_active: true
    },
    {
      id: 'office-moving-without-lift',
      title: 'Office Moving (Without Lift/Stairs)',
      description: 'Professional office moving service without elevator - €120/item',
      service_id: 'office-moving',
      pricing_type: 'per_unit',
      unit_price: 120,
      unit_measure: 'items',
      min_measurement: 1,
      max_measurement: 100,
      measurement_step: 1,
      measurement_placeholder: 'Enter number of items',
      duration: '6-12 hours',
      features: ['Office furniture', 'IT equipment', 'Filing systems', 'Stair handling', 'Specialized equipment'],
      is_active: true
    },
    
    // Furniture Assembly Options
    {
      id: 'furniture-ikea',
      title: 'IKEA Furniture Assembly',
      description: 'Professional assembly of IKEA furniture with warranty',
      service_id: 'furniture-assembly',
      price: 60,
      duration: '1-2 hours',
      features: ['IKEA furniture', 'Tool provided', 'Warranty included', 'Cleanup included'],
      is_active: true
    },
    {
      id: 'furniture-office',
      title: 'Office Furniture Assembly',
      description: 'Assembly of office desks, chairs, and storage units',
      service_id: 'furniture-assembly',
      price: 80,
      duration: '2-3 hours',
      features: ['Office desks', 'Office chairs', 'Storage units', 'Cable management'],
      is_active: true
    },
    {
      id: 'furniture-bedroom',
      title: 'Bedroom Furniture Assembly',
      description: 'Assembly of bedroom furniture including beds, dressers, and nightstands',
      service_id: 'furniture-assembly',
      price: 100,
      duration: '2-4 hours',
      features: ['Bed assembly', 'Dresser assembly', 'Nightstand setup', 'Mirror installation'],
      is_active: true
    }
  ];

  try {
    for (const option of defaultServiceOptions) {
      const { error } = await supabase
        .from('service_options')
        .upsert(option, { onConflict: 'id' });
      
      if (error) {
        console.log(`Service option ${option.id} already exists or error:`, error.message);
      }
    }
    console.log('✅ Default service options inserted/updated');
  } catch (error) {
    console.log('Note: Service options table might not exist yet or options already exist');
  }
};

// Connect to database
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to Supabase...');
    
    // Test connection
    const { data, error } = await supabase
      .from('services')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Database connection test failed, but continuing...');
      console.log('   This is normal if tables don\'t exist yet');
    } else {
      console.log('✅ Connected to Supabase successfully');
    }
    
    // Initialize database schema
    await initializeDatabase();
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Continuing without database connection...');
  }
};

module.exports = {
  connectDB,
  supabase,
  initializeDatabase
};
