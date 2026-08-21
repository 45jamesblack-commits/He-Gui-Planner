Add-Type -AssemblyName System.Drawing

$root = 'F:\Projects\He Gui GitHub\He-Gui-Planner'
$sourcePath = Join-Path $root 'Splash2.png'
$source = [System.Drawing.Image]::FromFile($sourcePath)

function New-HeguiIcon([int]$size, [string]$fileName) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(16,18,20))
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $targetWidth = [int][Math]::Round($size * 0.75)
    $targetHeight = [int][Math]::Round($targetWidth * $source.Height / $source.Width)
    $x = [int](($size - $targetWidth) / 2)
    $y = [int](($size - $targetHeight) / 2)

    $g.DrawImage($source, $x, $y, $targetWidth, $targetHeight)
    $outPath = Join-Path $root $fileName
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

New-HeguiIcon 192 'hegui-icon-192.png'
New-HeguiIcon 512 'hegui-icon-512.png'
New-HeguiIcon 180 'apple-touch-icon.png'

$source.Dispose()
