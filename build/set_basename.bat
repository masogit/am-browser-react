echo off
set basename=/AMB
set html=index.html
set htmlFullPath=%~dp0\dist\%html%
set properties_default=am-browser-config.properties.default
set properties=am-browser-config.properties
set origin=%html%_bak 
set originFullPath=%~dp0\dist\%html%_bak 

if not exist %originFullPath% ren %htmlFullPath% %origin%

rem new an empty file
echo. > %htmlFullPath%

SetLocal EnableDelayedExpansion
if exist %properties_default% (
  for /f "eol=# tokens=*" %%i in (%properties_default%) do (
    for /f "delims== tokens=1,2" %%a in ("%%i") do (
      set key=%%a
      call :TRIM key
      if '!key!' equ 'base' (
        set value=%%b
        call :TRIM value
        set basename=!value!
        goto check_properties
      )
    )
  )
) 

:check_properties
if exist %properties% (
  for /f "eol=# tokens=*" %%i in (%properties%) do (
    for /f "delims== tokens=1,*" %%a in ("%%i") do (
      set key=%%a
      call :TRIM key
      if '!key!' equ 'base' (
        set value=%%b
        call :TRIM value
        set basename=!value!
        goto :udpate_html
      )
    )
  )
) 

:udpate_html
if exist %originFullPath% (
  for /f "eol=# tokens=*" %%i in (%originFullPath%) do (
    for /f "delims== tokens=1" %%a in ("%%i") do (
      set key=%%a
      call :TRIM key
      if '!key!' equ 'window.amb_basename' (
        echo base name is set to %basename%
        echo window.amb_basename='%basename%'; >> %htmlFullPath%
      ) else (
        echo %%i >> %htmlFullPath%
      )
    )
  )
)

goto :end

:TRIM
SetLocal EnableDelayedExpansion
Call :TRIMSUB %%%1%%
EndLocal & set %1=%tempvar%

:TRIMSUB
set tempvar=%*

:end