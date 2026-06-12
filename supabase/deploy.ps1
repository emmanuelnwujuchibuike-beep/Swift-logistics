# ════════════════════════════════════════════════════════
#  Swift Freight Logistics — Supabase Deploy Script
#  Run once from the project root:
#    cd "c:\Users\u\OneDrive\Documents\logistics site"
#    .\supabase\deploy.ps1
#
#  Prerequisites:
#    1. Install Supabase CLI:  winget install Supabase.CLI
#    2. Log in:                supabase login
# ════════════════════════════════════════════════════════

$ErrorActionPreference = 'Stop'
$projectRef = 'oltbgccsceipedoadgka'

Write-Host "`n==> Linking project..." -ForegroundColor Cyan
supabase link --project-ref $projectRef

Write-Host "`n==> Setting secrets..." -ForegroundColor Cyan
supabase secrets set `
  RESEND_API_KEY="re_Hfaoff18_8LSgYoRJuJoa2TtbfZM7EvKj" `
  ADMIN_SECRET="SFL-ADMIN-2025-Xp7kZ3mN" `
  ADMIN_EMAIL="swiftfreightlogix@gmail.com" `
  FROM_EMAIL="Swift Freight Logistics <onboarding@resend.dev>"

Write-Host "`n==> Deploying edge functions..." -ForegroundColor Cyan
supabase functions deploy send-email        --project-ref $projectRef
supabase functions deploy register-shipment --project-ref $projectRef
supabase functions deploy update-shipment   --project-ref $projectRef
supabase functions deploy delete-shipment   --project-ref $projectRef
supabase functions deploy quote-request     --project-ref $projectRef
supabase functions deploy payment-proof     --project-ref $projectRef
supabase functions deploy package-confirm   --project-ref $projectRef
supabase functions deploy chat-notify       --project-ref $projectRef
supabase functions deploy update-setting    --project-ref $projectRef
supabase functions deploy admin-auth           --project-ref $projectRef
supabase functions deploy delivery-confirmation --project-ref $projectRef

Write-Host "`n✓ All done! Functions are live." -ForegroundColor Green
Write-Host "  Base URL: https://$projectRef.supabase.co/functions/v1/" -ForegroundColor Gray
Write-Host "  Admin secret: SFL-ADMIN-2025-Xp7kZ3mN  (save this!)" -ForegroundColor Yellow
