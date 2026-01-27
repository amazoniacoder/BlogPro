# PowerShell скрипт поиска CSS правил header

Write-Host "🔍 Поиск всех CSS классов .header и глобального правила header..." -ForegroundColor Green

# Поиск всех .header классов
Write-Host "`n📋 КЛАССЫ .header:" -ForegroundColor Yellow
Get-ChildItem -Path "d:\BlogPro\client\src" -Filter "*.css" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "\.header") {
        Write-Host "📁 $($_.FullName)" -ForegroundColor Cyan
        Select-String -Path $_.FullName -Pattern "\.header[^a-zA-Z]" | ForEach-Object {
            Write-Host "  Строка $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor White
        }
    }
}

# Поиск глобального правила header {
Write-Host "`n🚨 ПОИСК ГЛОБАЛЬНОГО ПРАВИЛА 'header {':" -ForegroundColor Red
$found = $false
Get-ChildItem -Path "d:\BlogPro\client\src" -Filter "*.css" -Recurse | ForEach-Object {
    $lines = Get-Content $_.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "^header\s*\{") {
            Write-Host "❌ НАЙДЕНО в: $($_.FullName)" -ForegroundColor Red
            Write-Host "   Строка $($i + 1): $($lines[$i])" -ForegroundColor White
            $found = $true
        }
    }
}

if (-not $found) {
    Write-Host "✅ Глобальное правило 'header {' НЕ НАЙДЕНО в CSS файлах" -ForegroundColor Green
}

Write-Host "`n🎯 Поиск проблемных стилей:" -ForegroundColor Yellow
$problemStyles = @("background: #1e293b", "padding: 1rem 2rem", "justify-content: space-between")
foreach ($style in $problemStyles) {
    Write-Host "`nПоиск: $style" -ForegroundColor Cyan
    Get-ChildItem -Path "d:\BlogPro\client\src" -Filter "*.css" -Recurse | ForEach-Object {
        Select-String -Path $_.FullName -Pattern [regex]::Escape($style) | ForEach-Object {
            Write-Host "  📁 $($_.Filename):$($_.LineNumber) - $($_.Line.Trim())" -ForegroundColor White
        }
    }
}