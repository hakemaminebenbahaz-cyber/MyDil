@echo off
echo.
echo  myDiL AI Server
echo  ===============
echo  Modele: TF-IDF + RandomForest (myDiL v1.0)
echo  Port: http://localhost:5001
echo.

cd /d "%~dp0"

:: Verifie si model.pkl existe
if not exist "model.pkl" (
    echo [!] model.pkl introuvable. Lancement de l'entrainement...
    python train.py
    if errorlevel 1 (
        echo [ERREUR] Entrainement echoue.
        pause
        exit /b 1
    )
)

echo [OK] Demarrage du serveur...
python api.py
pause
