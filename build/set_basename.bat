echo off
set basename=/
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
  set node=0
  for /f "eol=# tokens=*" %%i in (%properties_default%) do (
    for /f "delims== tokens=1,2" %%a in ("%%i") do (
      set key=%%a
      call :TRIM key
      if !node! equ 1 (
        if "!key:~0,1!" equ "[" goto check_properties
      )

      if "!key!" equ "[node]" set node=1
      if "!key!" equ "base" (
        if !node! equ 1 (
          set value=%%b
          call :TRIM value
          set basename=!value!
          goto check_properties
        )
      )
    )
  )
) 

:check_properties
if exist %properties% (
  set node=0
  for /f "eol=# tokens=*" %%i in (%properties%) do (
    for /f "delims== tokens=1,*" %%a in ("%%i") do (
      set key=%%a
      call :TRIM key
      if !node! equ 1 (
        if "!key:~0,1!" equ "[" goto udpate_html
      )

      if "!key!" equ "[node]" set node=1

      if "!key!" equ "base" (
        if !node! equ 1 (
          set value=%%b
          call :TRIM value
          set basename=!value!
          goto udpate_html
        )
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
        echo ####### INFO: SET BASE NAME #########
        echo base name is set to %basename%
        echo ##########################################################
        echo window.amb_basename='%basename%'; >> %htmlFullPath%
      ) else (
        SetLocal DISABLEDELAYEDEXPANSION
        echo %%i >> %htmlFullPath%
        EndLocal
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