import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────
// TRANSPORTER
// ─────────────────────────────────────────────

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "LOADED" : "MISSING");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────

const formatDate = () =>
  new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

// ─────────────────────────────────────────────
// BASE TEMPLATE  Executive Edition
// ─────────────────────────────────────────────

/**
 * Builds a premium, print-quality HTML email template.
 *
 * @param {Object}  params
 * @param {string}  params.title        – Short subject label (all-caps banner).
 * @param {string}  params.preheader    – Hidden preview text shown by mail clients.
 * @param {string}  params.body         – Main HTML content block (inner HTML).
 * @param {string}  [params.highlight]  – Optional coloured badge label (e.g. "APPROVED").
 * @param {string}  [params.highlightColor] – CSS colour for the badge (#hex). Defaults navy.
 * @param {string}  [params.footer]     – Optional footer override text.
 * @returns {string} Complete HTML email string.
 */
const buildEmailTemplate = ({
  title,
  preheader = '',
  body,
  highlight,
  highlightColor = '#0f2d6b',
  footer,
}) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title} PAAH</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Source+Sans+3:wght@300;400;600;700&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f0f2f5; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    .ExternalClass { width: 100%; }
    @media screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .stack-col { display: block !important; width: 100% !important; }
      .mobile-pad { padding: 20px 18px !important; }
      .credits-cell { border-left: none !important; border-top: 1px solid #e2e6ed !important; }
    }
  </style>
</head>
<body>

  <!-- PREHEADER (hidden) -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#f0f2f5;">
    ${preheader || title} PAAH Notification
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- OUTER WRAPPER -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#f0f2f5; padding: 32px 12px;">
    <tr>
      <td align="center">

        <!-- EMAIL SHELL -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px; width:100%; background:#ffffff;
                      box-shadow: 0 4px 24px rgba(0,0,0,0.10);">

          <!-- ═══ TOP RULE ═══ -->
          <tr>
            <td style="background: linear-gradient(90deg, #0f2d6b 0%, #1a52c2 55%, #0f2d6b 100%);
                       height: 5px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- ═══ HEADER ═══ -->
          <tr>
            <td style="background:#0f2d6b; padding: 22px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Logo -->
                  <td style="vertical-align: middle; width: 44px;">
                    <img src="https://raw.githubusercontent.com/RitheshJgit/logo-repo/main/paah_logo.png"
                         width="40" height="40" alt="PAAH"
                         style="display:block; border-radius:2px;
                                outline: 1px solid rgba(255,255,255,0.20);" />
                  </td>
                  <!-- Wordmark -->
                  <td style="vertical-align: middle; padding-left: 13px;">
                    <p style="margin:0; font-family:'Playfair Display', Georgia, serif;
                               font-size: 20px; font-weight: 600; color: #ffffff;
                               letter-spacing: 3px; line-height:1;">PAAH</p>
                    <p style="margin: 4px 0 0; font-family:'Source Sans 3', Arial, sans-serif;
                               font-size: 9px; color: #8eaee8; letter-spacing: 2px;
                               text-transform: uppercase; line-height:1;">
                      Poverty Awareness &amp; Action Hub
                    </p>
                  </td>
                  <!-- Date stamp -->
                  <td style="text-align:right; vertical-align: middle;">
                    <p style="margin:0; font-family:'Source Sans 3', Arial, sans-serif;
                               font-size: 10px; color: #8eaee8; letter-spacing: 0.5px;">
                      ${formatDate()}
                    </p>
                    <p style="margin: 3px 0 0; font-family:'Source Sans 3', Arial, sans-serif;
                               font-size: 9px; color: #5a7dbf; text-transform: uppercase;
                               letter-spacing: 1px;">
                      Official Correspondence
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ TITLE BAND ═══ -->
          <tr>
            <td style="background:#f7f8fb; padding: 14px 36px;
                       border-bottom: 1px solid #e2e6ed; border-top: 1px solid #dde2ec;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <p style="margin:0; font-family:'Source Sans 3', Arial, sans-serif;
                               font-size: 10px; color: #6b7a99; text-transform: uppercase;
                               letter-spacing: 1.5px; font-weight: 700;">
                      ${title}
                    </p>
                  </td>
                  ${highlight ? `
                  <td style="vertical-align: middle; text-align: right;">
                    <span style="display:inline-block; background:${highlightColor};
                                 color:#ffffff; font-family:'Source Sans 3', Arial, sans-serif;
                                 font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
                                 text-transform: uppercase; padding: 4px 10px 3px;
                                 border-radius: 2px;">
                      ${highlight}
                    </span>
                  </td>` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ BODY ═══ -->
          <tr>
            <td class="mobile-pad" style="padding: 34px 40px 28px;">
              <div style="font-family:'Source Sans 3', Arial, sans-serif;
                          font-size: 14.5px; color: #1e2b3c; line-height: 1.95;
                          font-weight: 300;">
                ${body}
              </div>
            </td>
          </tr>

          <!-- ═══ SIGNATURE ═══ -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="border-top: 1px solid #d0d8e8; padding-top: 18px;">
                <tr>
                  <td style="padding-top: 18px;">
                    <p style="margin:0; font-family:'Source Sans 3', Arial, sans-serif;
                               font-size: 13.5px; color: #0f2d6b; font-weight: 700;
                               letter-spacing: 0.3px;">PAAH Administration</p>
                    <p style="margin: 2px 0 0; font-family:'Source Sans 3', Arial, sans-serif;
                               font-size: 12px; color: #6b7a99;">
                      Poverty Awareness &amp; Action Hub
                    </p>
                    <p style="margin: 2px 0 0; font-family:'Source Sans 3', Arial, sans-serif;
                               font-size: 12px; color: #1a52c2;">support@paah.org</p>
                    <p style="margin: 8px 0 0; font-family:'Source Sans 3', Arial, sans-serif;
                               font-size: 11px; color: #9aa5b8; font-style: italic;">
                      This communication is issued on behalf of the PAAH administrative office.
                    </p>
                  </td>
                  <!-- Seal / Badge -->
                  <td style="vertical-align: bottom; text-align: right; padding-top: 18px; width: 54px;">
                    <div style="width:48px; height:48px; border-radius:50%;
                                background:#f0f4ff; border: 1.5px solid #c5d0e8;
                                display:inline-flex; align-items:center; justify-content:center;
                                font-family:'Playfair Display', Georgia, serif;
                                font-size:14px; color:#0f2d6b; font-weight:600;
                                line-height:48px; text-align:center;">P</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ BOTTOM RULE ═══ -->
          <tr>
            <td style="background: linear-gradient(90deg, #0f2d6b 0%, #1a52c2 55%, #0f2d6b 100%);
                       height: 2px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="background:#f7f8fb; padding: 16px 40px;
                       border-top: 1px solid #e8ebf2;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0; font-family:'Source Sans 3', Arial, sans-serif;
                               font-size: 11px; color: #7a8499; line-height: 1.6;">
                      ${footer || 'Thank you for your continued engagement with the PAAH community.'}
                    </p>
                  </td>
                  <td style="text-align:right; vertical-align: middle;
                             white-space: nowrap; padding-left: 16px;">
                    <p style="margin:0; font-family:'Source Sans 3', Arial, sans-serif;
                               font-size: 10px; color: #b0b8c9;">
                      &copy; ${new Date().getFullYear()} PAAH
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ LEGAL ═══ -->
          <tr>
            <td style="background:#eef0f5; padding: 10px 40px;
                       border-top: 1px solid #e2e6ed;">
              <p style="margin:0; font-family:'Source Sans 3', Arial, sans-serif;
                         font-size: 10px; color: #a0aab8; line-height: 1.6;">
                This is a system-generated message. Please do not reply to this email directly.
                For support, write to <span style="color:#1a52c2;">support@paah.org</span>.
              </p>
            </td>
          </tr>

        </table>
        <!-- /EMAIL SHELL -->

      </td>
    </tr>
  </table>

</body>
</html>
`;

// ─────────────────────────────────────────────
// CORE SEND FUNCTION
// ─────────────────────────────────────────────

/**
 * Sends an HTML email via the configured Nodemailer transporter.
 *
 * @param {Object} params
 * @param {string} params.to       - Recipient email address.
 * @param {string} params.subject  - Email subject line.
 * @param {string} params.html     - Full HTML body.
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({ 
      from: `"PAAH " <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.info(`[EmailService] Sent → ${to} | Subject: "${subject}"`);
  } catch (error) {
    console.error(`[EmailService] Failed → ${to} | ${error.message}`);
    throw error;
  }
};

// ─────────────────────────────────────────────
// COMPOSED EMAIL FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Notifies a user that their submitted task has been approved.
 */
export const sendTaskApprovedEmail = async (user, task) => {
  const html = buildEmailTemplate({
    title: 'Task Submission Approved',
    preheader: `Your task "${task.title}" has been approved and credits have been awarded.`,
    highlight: 'Approved',
    highlightColor: '#166534',
    body: `
      <p style="margin:0 0 16px;">Dear <strong style="font-weight:700;">${user.name || 'Contributor'}</strong>,</p>

      <p style="margin:0 0 16px;">
        We are pleased to inform you that your recent task submission has been reviewed and
        formally approved by the PAAH administration team. The details of your approved
        submission are noted below.
      </p>

      <!-- Task Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="margin:24px 0; border:1px solid #d0d8e8; border-radius:2px; overflow:hidden;">
        <tr>
          <td style="padding:16px 20px; background:#f7f8fb; border-bottom:1px solid #e2e6ed;">
            <p style="margin:0; font-family:'Source Sans 3',Arial,sans-serif;
                       font-size:9px; color:#6b7a99; text-transform:uppercase;
                       letter-spacing:1.5px; font-weight:700;">Approved Task</p>
          </td>
        </tr>
        <tr>
          <td class="stack-col" style="padding:18px 20px; vertical-align:middle;">
            <p style="margin:0; font-family:'Source Sans 3',Arial,sans-serif;
                       font-size:16px; font-weight:700; color:#0f2d6b;">
              ${task.title}
            </p>
          </td>
          <td class="stack-col credits-cell"
              style="padding:18px 24px; text-align:center; width:130px;
                     vertical-align:middle; border-left:1px solid #e2e6ed;
                     background:#f0f4ff; white-space:nowrap;">
            <p style="margin:0; font-family:'Source Sans 3',Arial,sans-serif;
                       font-size:9px; color:#6b7a99; text-transform:uppercase;
                       letter-spacing:1.2px; font-weight:700;">Credits Awarded</p>
            <p style="margin:6px 0 0; font-family:'Playfair Display',Georgia,serif;
                       font-size:28px; font-weight:600; color:#0f2d6b; line-height:1;">
              +${task.creditPoints}
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 16px;">
        The earned credits have been credited to your account and your trust score has been
        recalculated accordingly. Your contribution is reflected on the PAAH platform.
      </p>

      <p style="margin:0;">
        We appreciate your dedication and look forward to your continued involvement in the
        PAAH initiative.
      </p>

      <p style="margin:22px 0 0;">Yours sincerely,</p>
    `,
    footer: 'Your efforts contribute to lasting, positive change in communities across the nation.',
  });

  await sendEmail({ to: user.email, subject: 'Task Approved PAAH', html });
};

/**
 * Notifies a user that their donation has been verified.
 */
export const sendDonationApprovedEmail = async (user) => {
  const html = buildEmailTemplate({
    title: 'Donation Record Verified',
    preheader: 'Your recent donation has been successfully verified by PAAH.',
    highlight: 'Verified',
    highlightColor: '#166534',
    body: `
      <p style="margin:0 0 16px;">Dear <strong style="font-weight:700;">${user.name || 'Contributor'}</strong>,</p>

      <p style="margin:0 0 16px;">
        We are pleased to confirm that your recent donation has been successfully verified
        and formally approved by the PAAH administration team.
      </p>

      <!-- Info Box -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="margin:22px 0; border:1px solid #d0d8e8; border-left:4px solid #0f2d6b;
                    background:#f7f8fb;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0; font-family:'Source Sans 3',Arial,sans-serif;
                       font-size:13.5px; color:#1e2b3c; line-height:1.8; font-weight:300;">
              Your donation record has been updated on the PAAH platform. Your contribution
              has been officially recognised and is now reflected on the PAAH Leaderboard.
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 16px;">
        Your generosity has a direct and meaningful impact on individuals and communities in
        need. It is the commitment of contributors like yourself that sustains and advances
        the PAAH mission.
      </p>

      <p style="margin:0 0 16px;">
        We encourage you to continue leading by example and inspiring others through your
        actions.
      </p>

      <p style="margin:0;">Yours sincerely,</p>
    `,
    footer: 'Every contribution, regardless of size, creates real and lasting change.',
  });

  await sendEmail({ to: user.email, subject: 'Donation Verified PAAH', html });
};

/**
 * Sends a password reset link.
 */
export const sendResetPasswordEmail = async (user, resetLink) => {
  const html = buildEmailTemplate({
    title: 'Password Reset Action Required',
    preheader: 'A password reset has been requested for your PAAH account.',
    highlight: 'Security Alert',
    highlightColor: '#9a1c1c',
    body: `
      <p style="margin:0 0 16px;">Dear <strong style="font-weight:700;">${user.name || 'User'}</strong>,</p>

      <p style="margin:0 0 16px;">
        A request to reset the password associated with your PAAH account was received.
        If you initiated this request, please proceed using the secure link below.
      </p>

      <!-- Security Notice -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="margin:20px 0; background:#fff8f8; border:1px solid #f0c4c4;
                    border-left:4px solid #b91c1c;">
        <tr>
          <td style="padding:13px 18px;">
            <p style="margin:0; font-family:'Source Sans 3',Arial,sans-serif;
                       font-size:10px; color:#b91c1c; font-weight:700; letter-spacing:1px;
                       text-transform:uppercase;">Security Notice</p>
            <p style="margin:5px 0 0; font-family:'Source Sans 3',Arial,sans-serif;
                       font-size:12.5px; color:#5c1a1a;">
              This link expires in <strong>30 minutes</strong> and is valid for one use only.
              Do not share it with anyone, including PAAH staff.
            </p>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table role="presentation" cellpadding="0" cellspacing="0"
             style="margin: 28px auto; display:block; text-align:center;">
        <tr>
          <td align="center">
            <a href="${resetLink}"
               style="display:inline-block; background:#0f2d6b; color:#ffffff;
                      font-family:'Source Sans 3',Arial,sans-serif;
                      font-size:12px; font-weight:700; letter-spacing:2px;
                      text-transform:uppercase; text-decoration:none;
                      padding:15px 42px; border:2px solid #0f2d6b;">
              Reset My Password
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 6px; font-family:'Source Sans 3',Arial,sans-serif;
                 font-size:11.5px; color:#7a8499;">
        If the button above does not work, copy and paste this URL directly into your browser:
      </p>
      <p style="margin:0 0 20px; font-family:'Courier New',monospace; font-size:11px;
                 color:#1a52c2; background:#f0f4ff; padding:10px 14px;
                 border:1px solid #c5d0e8; word-break:break-all; line-height:1.6;">
        ${resetLink}
      </p>

      <p style="margin:0;">
        If you did not request a password reset, no further action is required. Your account
        remains secure and no changes have been made.
      </p>

      <p style="margin:22px 0 0;">Yours sincerely,</p>
    `,
    footer: 'If you did not initiate this request, please disregard this message. Your account is safe.',
  });

  await sendEmail({ to: user.email, subject: 'Password Reset Request PAAH', html });
};

/**
 * Sends a one-time OTP for account verification.
 */
export const sendOTPEmail = async (user, otp) => {
  const html = buildEmailTemplate({
    title: 'Verification Code  One Time Password',
    preheader: 'Your PAAH verification code is enclosed. Valid for 5 minutes.',
    highlight: 'Time-Sensitive',
    highlightColor: '#92400e',
    body: `
      <p style="margin:0 0 16px;">Dear <strong style="font-weight:700;">${user.name || 'User'}</strong>,</p>

      <p style="margin:0 0 20px;">
        A one-time verification code has been generated for your PAAH account as requested.
        Please use the code below to complete your verification.
      </p>

      <!-- OTP Display -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="margin:0 0 20px; border:1px solid #d0d8e8; overflow:hidden;">
        <tr>
          <td style="padding:28px 20px; text-align:center; background:#f7f8fb;">
            <p style="margin:0; font-family:'Source Sans 3',Arial,sans-serif;
                       font-size:9px; color:#6b7a99; text-transform:uppercase;
                       letter-spacing:2px; font-weight:700;">Your Verification Code</p>
            <p style="margin:14px 0 0; font-family:'Playfair Display',Georgia,serif;
                       font-size:38px; font-weight:600; color:#0f2d6b;
                       letter-spacing:14px; line-height:1;">
              ${otp}
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#fdf8ed; padding:11px 20px; text-align:center;
                     border-top:1px solid #e8dfc0;">
            <p style="margin:0; font-family:'Source Sans 3',Arial,sans-serif;
                       font-size:11.5px; color:#78530a; font-weight:600;">
              Valid for 5 minutes &nbsp;&bull;&nbsp; Single use only
            </p>
          </td>
        </tr>
      </table>

      <!-- Warning -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="margin:0 0 20px; background:#fff8f8; border:1px solid #f0c4c4;
                    border-left:4px solid #b91c1c;">
        <tr>
          <td style="padding:11px 16px;">
            <p style="margin:0; font-family:'Source Sans 3',Arial,sans-serif;
                       font-size:12px; color:#b91c1c; font-weight:700;">
              Do not share this code with anyone, including PAAH staff.
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:0;">
        If you did not request this code, please disregard this message. Your account
        remains secure and no changes have been made.
      </p>

      <p style="margin:22px 0 0;">Yours sincerely,</p>
    `,
    footer: 'This is a time-sensitive security code. Treat it with the same care as a password.',
  });

  await sendEmail({ to: user.email, subject: 'Verification Code PAAH', html });
};