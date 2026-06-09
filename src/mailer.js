const nodemailer = require('nodemailer');

function generateTrackingID() {
  const prefix = 'SFL-';
  const randomNumbers = Math.floor(100000000 + Math.random() * 900000000);
  return prefix + randomNumbers;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildShipmentEmail(customerName, trackingID) {
  const fn          = esc(customerName.split(' ')[0] || customerName);
  const SITE        = 'https://swiftfreightlogix.netlify.app';
  const trackUrl    = `${SITE}/payment.html?id=${trackingID}`;
  const confirmUrl  = `${SITE}/src/confirm.html?trackingId=${encodeURIComponent(trackingID)}&name=${encodeURIComponent(customerName)}`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <style>
    @media (prefers-color-scheme:dark){.em-bg{background:#03060f!important}}
    @media only screen and (max-width:620px){
      .em-card{width:100%!important;border-radius:0!important}
      .em-pad{padding:30px 22px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#03060f;-webkit-text-size-adjust:100%;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;
            color:transparent;height:0;width:0;font-size:1px;">
  Hi ${fn}, your Swift Freight shipment has been registered. Tracking ID: ${esc(trackingID)}. Confirm your package receipt now.&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<table role="presentation" class="em-bg" width="100%" border="0" cellpadding="0" cellspacing="0"
       style="background:#03060f;min-height:100vh;">
<tr><td align="center" valign="top" style="padding:52px 16px 80px;">
<table role="presentation" class="em-card" width="600" border="0" cellpadding="0" cellspacing="0"
       style="max-width:600px;width:100%;">

  <!-- Eyebrow -->
  <tr><td align="center" style="padding:0 0 22px;">
    <p style="margin:0;font-size:9px;letter-spacing:.56em;text-transform:uppercase;
       font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.28);">
      Swift Freight Logistics &nbsp;&bull;&nbsp; Shipment Notification
    </p>
  </td></tr>

  <!-- Header -->
  <tr><td style="background:linear-gradient(145deg,#130e2e 0%,#0d1048 55%,#090b28 100%);
                 border:1px solid rgba(124,58,237,.3);border-bottom:none;
                 border-radius:14px 14px 0 0;padding:36px 52px 30px;">
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td valign="middle">
          <p style="margin:0 0 5px;font-size:8px;letter-spacing:.62em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.38);">
            OFFICIAL NOTIFICATION
          </p>
          <p style="margin:0;line-height:1;font-size:0;">
            <span style="font-size:25px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;
                  font-family:Arial,Helvetica,sans-serif;color:#a78bfa;">SFL</span><span
                  style="font-size:25px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;
                  font-family:Arial,Helvetica,sans-serif;color:#dde5ff;">&thinsp;LOGISTICS</span>
          </p>
        </td>
        <td align="right" valign="middle">
          <span style="display:inline-block;padding:8px 18px;
                background:rgba(124,58,237,.13);border:1px solid rgba(167,139,250,.3);
                border-radius:4px;font-size:8px;letter-spacing:.3em;text-transform:uppercase;
                font-family:Arial,Helvetica,sans-serif;color:rgba(199,210,254,.72);">
            Shipment Alert
          </span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Gradient stripe: white → blue → purple -->
  <tr><td height="5" style="height:5px;line-height:5px;font-size:0;
      background:linear-gradient(90deg,#e0e7ff 0%,#93c5fd 14%,#3b82f6 38%,#6d28d9 68%,#c084fc 100%);">
    &zwnj;
  </td></tr>

  <!-- Body -->
  <tr><td class="em-pad"
          style="background:linear-gradient(180deg,#090d26 0%,#06091c 100%);
                 border-left:1px solid rgba(124,58,237,.15);
                 border-right:1px solid rgba(124,58,237,.15);
                 padding:52px 52px 46px;">

    <!-- Context pill -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:8px 20px;background:rgba(124,58,237,.1);
                   border:1px solid rgba(167,139,250,.24);border-radius:99px;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.18em;
             color:rgba(167,139,250,.9);font-family:Arial,Helvetica,sans-serif;
             text-transform:uppercase;">&#9670; Shipment Registered</p>
        </td>
      </tr>
    </table>

    <!-- Heading -->
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:900;letter-spacing:.02em;
       color:#eef2ff;font-family:Arial,Helvetica,sans-serif;line-height:1.2;">
      Your shipment is registered, ${fn}.
    </h1>
    <p style="margin:0 0 38px;font-size:14px;color:rgba(199,210,254,.52);line-height:1.95;
       font-family:Arial,Helvetica,sans-serif;">
      A package bearing your name has been logged and registered in our system. Review the details below and confirm receipt to begin the delivery process.
    </p>

    <!-- Tracking ID box -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:8px;">
      <tr>
        <td style="padding:20px 24px 22px;
                   background:linear-gradient(135deg,rgba(109,40,217,.12),rgba(37,99,235,.12));
                   border:1px solid rgba(124,58,237,.28);border-radius:8px;text-align:center;">
          <p style="margin:0 0 6px;font-size:8px;letter-spacing:.32em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.5);">Your Tracking ID</p>
          <p style="margin:0;font-size:26px;font-weight:900;letter-spacing:.18em;
             font-family:'Courier New',monospace;color:#a78bfa;line-height:1.1;">${esc(trackingID)}</p>
        </td>
      </tr>
    </table>

    <!-- Info fields -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:8px;">
      <tr>
        <td width="49%" valign="top"
            style="padding:15px 22px 17px;background:#050818;
                   border:1px solid rgba(124,58,237,.18);border-radius:7px;">
          <p style="margin:0 0 5px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.5);">Recipient</p>
          <p style="margin:0;font-size:14px;color:#dde5ff;
             font-family:Arial,Helvetica,sans-serif;">${esc(customerName)}</p>
        </td>
        <td width="2%">&nbsp;</td>
        <td width="49%" valign="top"
            style="padding:15px 22px 17px;background:#050818;
                   border:1px solid rgba(124,58,237,.18);border-radius:7px;">
          <p style="margin:0 0 5px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.5);">Status</p>
          <p style="margin:0;font-size:14px;color:rgba(167,139,250,.9);font-weight:600;
             font-family:Arial,Helvetica,sans-serif;">&#9679; Registered</p>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:34px;">
      <tr>
        <td style="padding:15px 22px 17px;background:#050818;
                   border:1px solid rgba(124,58,237,.18);border-radius:7px;">
          <p style="margin:0 0 5px;font-size:8px;letter-spacing:.28em;text-transform:uppercase;
             font-family:Arial,Helvetica,sans-serif;color:rgba(167,139,250,.5);">Service</p>
          <p style="margin:0;font-size:14px;color:#dde5ff;
             font-family:Arial,Helvetica,sans-serif;">
            Swift Freight International Logistics &nbsp;&bull;&nbsp; Priority Processing
          </p>
        </td>
      </tr>
    </table>

    <!-- Action call-out -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:32px;">
      <tr>
        <td style="padding:20px 24px;
                   background:rgba(124,58,237,.07);
                   border:1px solid rgba(167,139,250,.2);
                   border-left:3px solid #7c3aed;
                   border-radius:0 8px 8px 0;">
          <p style="margin:0 0 5px;font-size:12px;font-weight:700;color:rgba(167,139,250,.85);
             font-family:Arial,Helvetica,sans-serif;letter-spacing:.04em;">Action Required</p>
          <p style="margin:0;font-size:13px;line-height:1.85;color:rgba(199,210,254,.65);
             font-family:Arial,Helvetica,sans-serif;">
            Click <strong style="color:rgba(224,231,255,.85);">Confirm Package Receipt</strong> below to register your delivery and move your shipment to active processing. This is required to initiate dispatch.
          </p>
        </td>
      </tr>
    </table>

    <!-- Primary CTA: Confirm -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
      <tr>
        <td style="border-radius:7px;
                   background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 48%,#7c3aed 100%);
                   box-shadow:0 10px 40px rgba(124,58,237,.5);">
          <a href="${confirmUrl}"
             style="display:inline-block;padding:18px 50px;font-size:11px;font-weight:700;
                    letter-spacing:.28em;text-transform:uppercase;color:#ffffff;text-decoration:none;
                    font-family:Arial,Helvetica,sans-serif;">
            Confirm Package Receipt &nbsp;&rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Secondary CTA: Track -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
      <tr>
        <td style="padding:12px 28px;border:1px solid rgba(124,58,237,.28);border-radius:6px;">
          <a href="${trackUrl}"
             style="font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;
                    color:rgba(167,139,250,.8);text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
            Track My Package &nbsp;&rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin:38px 0;">
      <tr><td height="1" style="height:1px;line-height:1px;font-size:0;
          background:linear-gradient(90deg,transparent,rgba(124,58,237,.18),transparent);">
        &zwnj;
      </td></tr>
    </table>

    <!-- Footer note -->
    <p style="margin:0;font-size:12px;color:rgba(199,210,254,.28);line-height:2;
       font-family:Arial,Helvetica,sans-serif;text-align:center;">
      If you did not request this shipment or do not recognise this package,<br>
      please disregard this email or contact
      <a href="mailto:swiftfreightlogix@gmail.com" style="color:rgba(167,139,250,.55);
         text-decoration:none;font-family:Arial,Helvetica,sans-serif;">swiftfreightlogix@gmail.com</a>
    </p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#040712;border:1px solid rgba(124,58,237,.14);border-top:none;
                 border-radius:0 0 14px 14px;padding:26px 52px 32px;" align="center">
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"
           style="margin-bottom:18px;">
      <tr><td height="1" style="height:1px;line-height:1px;font-size:0;
          background:linear-gradient(90deg,transparent,rgba(124,58,237,.25),transparent);">
        &zwnj;
      </td></tr>
    </table>
    <p style="margin:0 0 12px;font-size:11px;color:rgba(199,210,254,.22);line-height:2.5;
       font-family:Arial,Helvetica,sans-serif;">
      <a href="https://swiftfreightlogix.netlify.app" style="color:rgba(167,139,250,.5);
         text-decoration:none;font-family:Arial,Helvetica,sans-serif;">swiftfreightlogix.netlify.app</a>
      &nbsp;&bull;&nbsp;
      <a href="${trackUrl}" style="color:rgba(167,139,250,.5);text-decoration:none;
         font-family:Arial,Helvetica,sans-serif;">Track Shipment</a>
      &nbsp;&bull;&nbsp;
      <a href="mailto:swiftfreightlogix@gmail.com" style="color:rgba(167,139,250,.5);
         text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Contact Support</a>
    </p>
    <p style="margin:0 0 10px;font-size:8px;color:rgba(199,210,254,.1);letter-spacing:.18em;
       text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">
      Automated notification &nbsp;&bull;&nbsp; Please do not reply to this email
    </p>
    <p style="margin:0;font-size:9px;color:rgba(199,210,254,.14);line-height:2;
       font-family:Arial,Helvetica,sans-serif;">
      USDOT: 3487219 &nbsp;&bull;&nbsp; MC: 1147826 &nbsp;&bull;&nbsp; FMC Licensed<br>
      1201 Peachtree Street NE, Atlanta, GA 30361, USA
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

async function sendTrackingEmail(customerEmail, customerName) {
  const trackingID = generateTrackingID();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'swiftfreightlogix@gmail.com',
      pass: 'rqzpcacnpqaolngg',
    },
  });

  const mailOptions = {
    from: '"Swift Freight Logistics" <swiftfreightlogix@gmail.com>',
    to: customerEmail,
    subject: `Your Shipment Is Registered — ${trackingID}`,
    text: `Hello ${customerName}, your shipment ${trackingID} has been registered with Swift Freight Logistics. Confirm receipt at: https://swiftfreightlogix.netlify.app/src/confirm.html?trackingId=${trackingID}&name=${encodeURIComponent(customerName)}`,
    html: buildShipmentEmail(customerName, trackingID),
    attachments: [{
      filename: 'mainlog.jpeg',
      path: './image/mainlog.jpeg',
      cid: 'mainlog.jpeg',
    }],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Shipment email sent:', info.messageId);
    return trackingID;
  } catch (error) {
    console.log('!!! Email error:', error.message);
    throw error;
  }
}

module.exports = { sendTrackingEmail };
