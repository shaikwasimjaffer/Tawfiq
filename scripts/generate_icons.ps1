Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\SHAIK WASIM JAFFER\.gemini\antigravity-ide\brain\9b1ad5bb-94d7-41b5-9e2b-4bc6c4cf619d\.user_uploaded\media_1792670033909.jpg"
$destDir = "c:\Users\SHAIK WASIM JAFFER\OneDrive\Desktop\tawfiq app final\tawfiq-plus\public"

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($img, $width, $height, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Resize-Image $srcImg 16 16 "$destDir\favicon-16x16.png"
Resize-Image $srcImg 32 32 "$destDir\favicon-32x32.png"
Resize-Image $srcImg 180 180 "$destDir\apple-touch-icon.png"
Resize-Image $srcImg 192 192 "$destDir\icon-192.png"
Resize-Image $srcImg 512 512 "$destDir\icon-512.png"
Resize-Image $srcImg 1024 1024 "$destDir\app-icon.png"
Copy-Item "$destDir\favicon-32x32.png" "$destDir\favicon.png" -Force

$bmp32 = New-Object System.Drawing.Bitmap("$destDir\favicon-32x32.png")
$hIcon = $bmp32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream("$destDir\favicon.ico", [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$bmp32.Dispose()

$srcImg.Dispose()
Write-Host "Icons generated successfully!"
