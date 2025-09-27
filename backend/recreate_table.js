const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function recreateServiceBookingsTable() {
  try {
    console.log('🗑️  Dropping existing service_bookings table...');
    
    // Drop the table
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS service_bookings CASCADE;'
    });
    
    if (dropError) {
      console.log('Note: Table might not exist or already dropped:', dropError.message);
    } else {
      console.log('✅ Table dropped successfully');
    }

    console.log('🏗️  Creating new service_bookings table...');
    
    // Create the table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE service_bookings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            service_id VARCHAR(255) NOT NULL,
            service_variant_id VARCHAR(255),
            booking_date DATE NOT NULL,
            booking_time TIME NOT NULL,
            duration_minutes INTEGER NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(20),
            service_address TEXT NOT NULL,
            special_instructions TEXT,
            total_amount DECIMAL(10,2) NOT NULL,
            payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
            payment_method VARCHAR(50) DEFAULT 'pending',
            assigned_staff VARCHAR(255),
            staff_notes TEXT,
            actual_start_time TIMESTAMP,
            actual_end_time TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      return;
    }
    
    console.log('✅ Table created successfully');

    console.log('🔗 Adding foreign key constraints...');
    
    // Add foreign key constraints
    const constraints = [
      'ALTER TABLE service_bookings ADD CONSTRAINT fk_service_bookings_user FOREIGN KEY (user_id) REFERENCES mobile_users(id) ON DELETE CASCADE;',
      'ALTER TABLE service_bookings ADD CONSTRAINT fk_service_bookings_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE;',
      'ALTER TABLE service_bookings ADD CONSTRAINT fk_service_bookings_service_variant FOREIGN KEY (service_variant_id) REFERENCES service_variants(id) ON DELETE CASCADE;'
    ];
    
    for (const constraint of constraints) {
      const { error: constraintError } = await supabase.rpc('exec_sql', {
        sql: constraint
      });
      
      if (constraintError) {
        console.log('Note: Constraint might already exist:', constraintError.message);
      }
    }
    
    console.log('✅ Foreign key constraints added');

    console.log('📊 Adding indexes...');
    
    // Add indexes
    const indexes = [
      'CREATE INDEX idx_service_bookings_user_id ON service_bookings(user_id);',
      'CREATE INDEX idx_service_bookings_service_id ON service_bookings(service_id);',
      'CREATE INDEX idx_service_bookings_service_variant_id ON service_bookings(service_variant_id);',
      'CREATE INDEX idx_service_bookings_booking_date ON service_bookings(booking_date);',
      'CREATE INDEX idx_service_bookings_status ON service_bookings(status);',
      'CREATE INDEX idx_service_bookings_created_at ON service_bookings(created_at);'
    ];
    
    for (const index of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: index
      });
      
      if (indexError) {
        console.log('Note: Index might already exist:', indexError.message);
      }
    }
    
    console.log('✅ Indexes added');

    console.log('🔍 Verifying table creation...');
    
    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('service_bookings')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error testing table:', testError);
    } else {
      console.log('✅ Table verification successful:', testData);
    }
    
    console.log('🎉 Service bookings table recreated successfully!');
    
  } catch (error) {
    console.error('❌ Error recreating table:', error);
  }
}

// Run the script
recreateServiceBookingsTable();
