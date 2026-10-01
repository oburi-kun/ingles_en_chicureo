# Genera js/indice.js con el texto de cada página del menú para el buscador.
# Ejecutar cada vez que se modifique el contenido de las páginas:
#   powershell -ExecutionPolicy Bypass -File generar-indice.ps1

$raiz = $PSScriptRoot
$paginas = @(
  'index.html',
  'quienes-somos.html',
  'examenes-y-certificaciones.html',
  'deportistas-de-elite.html',
  'cursos-y-clases.html',
  'clases-adultos.html',
  'nivelacion-y-apoyo-escolar.html',
  'contacto.html'
)

$indice = foreach ($p in $paginas) {
  $html = [IO.File]::ReadAllText((Join-Path $raiz $p), [Text.Encoding]::UTF8)

  $titulo = ([regex]::Match($html, '(?s)<title>(.*?)</title>').Groups[1].Value -split ' \| ')[0]
  $main = [regex]::Match($html, '(?s)<main[^>]*>(.*?)</main>').Groups[1].Value
  $main = [regex]::Replace($main, '(?s)<p class="migas">.*?</p>', ' ')
  $main = [regex]::Replace($main, '(?s)<[^>]+>', ' ')
  $texto = [regex]::Replace([Net.WebUtility]::HtmlDecode($main), '\s+', ' ').Trim()

  [pscustomobject]@{ url = $p; titulo = $titulo.Trim(); texto = $texto }
}

$json = ConvertTo-Json -InputObject @($indice) -Depth 3
$salida = "window.INDICE_BUSQUEDA = $json;`n"
[IO.File]::WriteAllText((Join-Path $raiz 'js\indice.js'), $salida, (New-Object Text.UTF8Encoding($false)))
Write-Host "Índice generado con $(@($indice).Count) páginas."
