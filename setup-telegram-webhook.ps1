# PowerShell script to set up Telegram webhook for BSM
# Usage: .\setup-telegram-webhook.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$BotToken
)

$Domain = "https://bsm.center"
$WebhookUrl = "$Domain/api/telegram/webhook"

Write-Host "🔗 Setting up Telegram webhook..." -ForegroundColor Cyan
Write-Host "📡 Domain: $Domain" -ForegroundColor Yellow
Write-Host "🤖 Webhook URL: $WebhookUrl" -ForegroundColor Yellow
Write-Host ""

# Set webhook
$SetWebhookUrl = "https://api.telegram.org/bot$BotToken/setWebhook"
$Body = @{
    url = $WebhookUrl
} | ConvertTo-Json

try {
    $Response = Invoke-RestMethod -Uri $SetWebhookUrl -Method Post -Body $Body -ContentType "application/json"
    
    if ($Response.ok) {
        Write-Host "✅ Webhook configured successfully!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ Failed to set webhook:" -ForegroundColor Red
        Write-Host $Response.description -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error setting webhook: $_" -ForegroundColor Red
    exit 1
}

# Check webhook info
Write-Host "📊 Verifying webhook status..." -ForegroundColor Cyan
$InfoUrl = "https://api.telegram.org/bot$BotToken/getWebhookInfo"

try {
    $Info = Invoke-RestMethod -Uri $InfoUrl -Method Get
    
    Write-Host ""
    Write-Host "Webhook Information:" -ForegroundColor Yellow
    Write-Host "  URL: $($Info.result.url)" -ForegroundColor White
    Write-Host "  Pending updates: $($Info.result.pending_update_count)" -ForegroundColor White
    Write-Host "  Last error: $($Info.result.last_error_message)" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Bot is now active 24/7!" -ForegroundColor Green
    Write-Host "🧪 Test by sending /start to your bot on Telegram" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️ Could not verify webhook info: $_" -ForegroundColor Yellow
}

