REM ===============================================
REM 作者：龙仕云
REM 将文件时行压缩之后生成文件拷贝到固定的目录下
REM 
REM ===============================================

set todir="C:\node-webkit-v0.7.3-win-ia32"
set zipexe="C:\Program Files\WinRAR\WinRAR.exe"
set nwexedir=node-webkit-v0.7.3-win-ia32
set nwexe=%nwexedir%\nw.exe
set zipname=node-web.zip
set exename="app.exe"

del %zipname%
del %nwexedir%\%zipname%

REM 合成文件 -r 表示包括子目录
%zipexe% a -r %zipname% @zipfiles.lst

copy %zipname%  %nwexedir%\%zipname%
REM copy /b %nwexe%+%zipname% %exename%

%nwexe% %zipname%

REM %exename%

exit



