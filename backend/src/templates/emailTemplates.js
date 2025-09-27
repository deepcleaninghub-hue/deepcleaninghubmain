/**
 * Email Templates for Order Confirmations
 * 
 * Contains HTML templates for customer and admin order confirmation emails
 */

const getCustomerOrderConfirmationTemplate = (orderData) => {
  const {
    customerName,
    customerEmail,
    orderId,
    orderDate,
    serviceDate,
    serviceTime,
    totalAmount,
    services,
    address,
    specialInstructions
  } = orderData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Deep Clean Hub</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .order-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-info h2 {
            color: #667eea;
            margin-top: 0;
            font-size: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #495057;
        }
        .info-value {
            color: #212529;
        }
        .services-section {
            margin: 20px 0;
        }
        .service-item {
            background-color: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
        }
        .service-name {
            font-weight: 600;
            color: #667eea;
            font-size: 16px;
        }
        .service-price {
            color: #28a745;
            font-weight: 600;
            font-size: 18px;
        }
        .address-section {
            background-color: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .address-section h3 {
            color: #1976d2;
            margin-top: 0;
        }
        .total-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 700;
            color: #28a745;
        }
        .next-steps {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .next-steps h3 {
            color: #856404;
            margin-top: 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .contact-info {
            margin: 10px 0;
        }
        .contact-info a {
            color: #667eea;
            text-decoration: none;
        }
        .status-badge {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧹 Deep Clean Hub</h1>
            <p>Your cleaning service order has been confirmed!</p>
        </div>
        
        <div class="content">
            <div class="order-info">
                <h2>📋 Order Details</h2>
                <div class="info-row">
                    <span class="info-label">Order ID:</span>
                    <span class="info-value">#${orderId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Order Date:</span>
                    <span class="info-value">${orderDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Service Date:</span>
                    <span class="info-value">${serviceDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Service Time:</span>
                    <span class="info-value">${serviceTime}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                        <span class="status-badge">Confirmed</span>
                    </span>
                </div>
            </div>

            <div class="services-section">
                <h3>🛠️ Services Booked</h3>
                ${services.map(service => `
                    <div class="service-item">
                        <div class="service-name">${service.name}</div>
                        <div class="service-price">${service.price}</div>
                    </div>
                `).join('')}
            </div>

            <div class="address-section">
                <h3>📍 Service Address</h3>
                <p><strong>${address.street_address}</strong></p>
                <p>${address.city}, ${address.postal_code}</p>
                <p>${address.country}</p>
                ${specialInstructions ? `
                    <p><strong>Special Instructions:</strong></p>
                    <p>${specialInstructions}</p>
                ` : ''}
            </div>

            <div class="total-section">
                <h3>💰 Total Amount</h3>
                <div class="total-amount">€${totalAmount.toFixed(2)}</div>
            </div>

            <div class="next-steps">
                <h3>📅 What Happens Next?</h3>
                <ul>
                    <li>Our team will contact you within 24 hours to confirm details</li>
                    <li>You'll receive a reminder 24 hours before your service</li>
                    <li>Our professional cleaners will arrive at the scheduled time</li>
                    <li>Payment will be collected after service completion</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <div class="contact-info">
                <p><strong>Need Help?</strong></p>
                <p>📞 Phone: <a href="tel:+4916097044182">+49-16097044182</a></p>
                <p>📧 Email: <a href="mailto:info@deepcleaninghub.com">info@deepcleaninghub.com</a></p>
                <p>💬 WhatsApp: <a href="https://wa.me/4916097044182">Chat with us</a></p>
            </div>
            <p>Thank you for choosing Deep Clean Hub for your cleaning needs!</p>
            <p>© 2024 Deep Clean Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

const getAdminOrderNotificationTemplate = (orderData) => {
  const {
    customerName,
    customerEmail,
    customerPhone = 'Not provided',
    orderId,
    orderDate,
    serviceDate,
    serviceTime,
    totalAmount,
    services,
    address,
    specialInstructions
  } = orderData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification - Deep Clean Hub Admin</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .alert-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .alert-box h2 {
            color: #856404;
            margin-top: 0;
        }
        .order-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-info h2 {
            color: #dc3545;
            margin-top: 0;
            font-size: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #495057;
        }
        .info-value {
            color: #212529;
        }
        .customer-section {
            background-color: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .customer-section h3 {
            color: #1976d2;
            margin-top: 0;
        }
        .services-section {
            margin: 20px 0;
        }
        .service-item {
            background-color: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
        }
        .service-name {
            font-weight: 600;
            color: #dc3545;
            font-size: 16px;
        }
        .service-price {
            color: #28a745;
            font-weight: 600;
            font-size: 18px;
        }
        .address-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .address-section h3 {
            color: #495057;
            margin-top: 0;
        }
        .total-section {
            background-color: #e8f5e8;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 700;
            color: #28a745;
        }
        .action-buttons {
            text-align: center;
            margin: 30px 0;
        }
        .action-button {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 0 10px;
            font-weight: 600;
        }
        .action-button:hover {
            background-color: #c82333;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .priority-badge {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 New Order Alert</h1>
            <p>Deep Clean Hub - Admin Dashboard</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h2>⚠️ Action Required</h2>
                <p>A new order has been placed and requires immediate attention!</p>
            </div>

            <div class="order-info">
                <h2>📋 Order Information</h2>
                <div class="info-row">
                    <span class="info-label">Order ID:</span>
                    <span class="info-value">#${orderId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Order Date:</span>
                    <span class="info-value">${orderDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Service Date:</span>
                    <span class="info-value">${serviceDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Service Time:</span>
                    <span class="info-value">${serviceTime}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Priority:</span>
                    <span class="info-value">
                        <span class="priority-badge">High</span>
                    </span>
                </div>
            </div>

            <div class="customer-section">
                <h3>👤 Customer Information</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${customerName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${customerEmail}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${customerPhone}</span>
                </div>
            </div>

            <div class="services-section">
                <h3>🛠️ Services Requested</h3>
                ${services.map(service => `
                    <div class="service-item">
                        <div class="service-name">${service.name}</div>
                        <div class="service-price">${service.price}</div>
                    </div>
                `).join('')}
            </div>

            <div class="address-section">
                <h3>📍 Service Address</h3>
                <p><strong>${address.street_address}</strong></p>
                <p>${address.city}, ${address.postal_code}</p>
                <p>${address.country}</p>
                ${specialInstructions ? `
                    <p><strong>Special Instructions:</strong></p>
                    <p>${specialInstructions}</p>
                ` : ''}
            </div>

            <div class="total-section">
                <h3>💰 Order Total</h3>
                <div class="total-amount">€${totalAmount.toFixed(2)}</div>
            </div>

            <div class="action-buttons">
                <a href="#" class="action-button">View in Dashboard</a>
                <a href="#" class="action-button">Contact Customer</a>
                <a href="#" class="action-button">Assign Cleaner</a>
            </div>
        </div>

        <div class="footer">
            <p><strong>Admin Dashboard</strong></p>
            <p>This is an automated notification from Deep Clean Hub</p>
            <p>Please respond to this order within 2 hours</p>
        </div>
    </div>
</body>
</html>
  `;
};

const getCustomerCancellationTemplate = (orderData) => {
  const {
    customerName,
    orderId,
    orderDate,
    serviceDate,
    serviceTime,
    totalAmount,
    services,
    address,
    cancellationReason,
    cancelledBy
  } = orderData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Cancellation - Deep Clean Hub</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .cancellation-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .cancellation-info h2 {
            color: #856404;
            margin-top: 0;
        }
        .order-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-info h2 {
            color: #dc3545;
            margin-top: 0;
            font-size: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #495057;
        }
        .info-value {
            color: #212529;
        }
        .services-section {
            margin: 20px 0;
        }
        .service-item {
            background-color: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
        }
        .service-name {
            font-weight: 600;
            color: #dc3545;
            font-size: 16px;
        }
        .service-price {
            color: #6c757d;
            font-weight: 600;
            font-size: 18px;
        }
        .address-section {
            background-color: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .address-section h3 {
            color: #1976d2;
            margin-top: 0;
        }
        .total-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 700;
            color: #6c757d;
            text-decoration: line-through;
        }
        .next-steps {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .next-steps h3 {
            color: #0c5460;
            margin-top: 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .contact-info {
            margin: 10px 0;
        }
        .contact-info a {
            color: #dc3545;
            text-decoration: none;
        }
        .status-badge {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧹 Deep Clean Hub</h1>
            <p>Order Cancellation Confirmation</p>
        </div>
        
        <div class="content">
            <div class="cancellation-info">
                <h2>❌ Order Cancelled</h2>
                <p>We're sorry to inform you that your cleaning service order has been cancelled.</p>
            </div>

            <div class="order-info">
                <h2>📋 Cancelled Order Details</h2>
                <div class="info-row">
                    <span class="info-label">Order ID:</span>
                    <span class="info-value">#${orderId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Order Date:</span>
                    <span class="info-value">${orderDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Service Date:</span>
                    <span class="info-value">${serviceDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Service Time:</span>
                    <span class="info-value">${serviceTime}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                        <span class="status-badge">Cancelled</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Cancelled By:</span>
                    <span class="info-value">${cancelledBy || 'Customer'}</span>
                </div>
            </div>

            <div class="services-section">
                <h3>🛠️ Services That Were Booked</h3>
                ${services.map(service => `
                    <div class="service-item">
                        <div class="service-name">${service.name}</div>
                        <div class="service-price">${service.price}</div>
                    </div>
                `).join('')}
            </div>

            <div class="address-section">
                <h3>📍 Service Address</h3>
                <p><strong>${address.street_address}</strong></p>
                <p>${address.city}, ${address.postal_code}</p>
                <p>${address.country}</p>
            </div>

            <div class="total-section">
                <h3>💰 Order Total</h3>
                <div class="total-amount">€${totalAmount.toFixed(2)}</div>
                <p><em>This amount will not be charged</em></p>
            </div>

            ${cancellationReason ? `
                <div class="cancellation-info">
                    <h3>📝 Cancellation Reason</h3>
                    <p>${cancellationReason}</p>
                </div>
            ` : ''}

            <div class="next-steps">
                <h3>🔄 What Happens Next?</h3>
                <ul>
                    <li>No charges will be applied to your account</li>
                    <li>If you paid in advance, a full refund will be processed within 3-5 business days</li>
                    <li>You can book a new service anytime through our website or app</li>
                    <li>If you have any questions, please contact our support team</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <div class="contact-info">
                <p><strong>Need Help?</strong></p>
                <p>📞 Phone: <a href="tel:+4916097044182">+49-16097044182</a></p>
                <p>📧 Email: <a href="mailto:info@deepcleaninghub.com">info@deepcleaninghub.com</a></p>
                <p>💬 WhatsApp: <a href="https://wa.me/4916097044182">Chat with us</a></p>
            </div>
            <p>We apologize for any inconvenience caused.</p>
            <p>© 2024 Deep Clean Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

const getAdminCancellationTemplate = (orderData) => {
  const {
    customerName,
    customerEmail,
    customerPhone = 'Not provided',
    orderId,
    orderDate,
    serviceDate,
    serviceTime,
    totalAmount,
    services,
    address,
    cancellationReason,
    cancelledBy
  } = orderData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Cancellation Alert - Deep Clean Hub Admin</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .alert-box {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .alert-box h2 {
            color: #721c24;
            margin-top: 0;
        }
        .order-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-info h2 {
            color: #dc3545;
            margin-top: 0;
            font-size: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #495057;
        }
        .info-value {
            color: #212529;
        }
        .customer-section {
            background-color: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .customer-section h3 {
            color: #1976d2;
            margin-top: 0;
        }
        .services-section {
            margin: 20px 0;
        }
        .service-item {
            background-color: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
        }
        .service-name {
            font-weight: 600;
            color: #dc3545;
            font-size: 16px;
        }
        .service-price {
            color: #6c757d;
            font-weight: 600;
            font-size: 18px;
        }
        .address-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .address-section h3 {
            color: #495057;
            margin-top: 0;
        }
        .total-section {
            background-color: #e8f5e8;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 700;
            color: #6c757d;
            text-decoration: line-through;
        }
        .cancellation-reason {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .cancellation-reason h3 {
            color: #856404;
            margin-top: 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .priority-badge {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Order Cancellation Alert</h1>
            <p>Deep Clean Hub - Admin Dashboard</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h2>⚠️ Order Cancelled</h2>
                <p>An order has been cancelled and requires your attention!</p>
            </div>

            <div class="order-info">
                <h2>📋 Cancelled Order Information</h2>
                <div class="info-row">
                    <span class="info-label">Order ID:</span>
                    <span class="info-value">#${orderId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Order Date:</span>
                    <span class="info-value">${orderDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Service Date:</span>
                    <span class="info-value">${serviceDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Service Time:</span>
                    <span class="info-value">${serviceTime}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                        <span class="priority-badge">Cancelled</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Cancelled By:</span>
                    <span class="info-value">${cancelledBy || 'Customer'}</span>
                </div>
            </div>

            <div class="customer-section">
                <h3>👤 Customer Information</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${customerName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${customerEmail}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${customerPhone}</span>
                </div>
            </div>

            <div class="services-section">
                <h3>🛠️ Services That Were Booked</h3>
                ${services.map(service => `
                    <div class="service-item">
                        <div class="service-name">${service.name}</div>
                        <div class="service-price">${service.price}</div>
                    </div>
                `).join('')}
            </div>

            <div class="address-section">
                <h3>📍 Service Address</h3>
                <p><strong>${address.street_address}</strong></p>
                <p>${address.city}, ${address.postal_code}</p>
                <p>${address.country}</p>
            </div>

            <div class="total-section">
                <h3>💰 Order Total</h3>
                <div class="total-amount">€${totalAmount.toFixed(2)}</div>
                <p><em>Revenue lost due to cancellation</em></p>
            </div>

            ${cancellationReason ? `
                <div class="cancellation-reason">
                    <h3>📝 Cancellation Reason</h3>
                    <p>${cancellationReason}</p>
                </div>
            ` : ''}
        </div>

        <div class="footer">
            <p><strong>Admin Dashboard</strong></p>
            <p>This is an automated notification from Deep Clean Hub</p>
            <p>Please review the cancellation and take appropriate action if needed</p>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
  getCustomerOrderConfirmationTemplate,
  getAdminOrderNotificationTemplate,
  getCustomerCancellationTemplate,
  getAdminCancellationTemplate
};
