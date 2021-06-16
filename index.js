const { app, BrowserWindow, autoUpdater } = require('electron')
const electron = require('electron')
const child_process = require('child_process')
const dialog = electron.dialog
const path = require('path')

const server = 'https://update.electronjs.org'
const feed = '`${server}/ImExiledd/ServerTool/${process.platform}-${process.arch}/${app.getVersion()}`'
autoUpdater.setFeedURL(feed)

const isDev = require('electron-is-dev')
if(isDev) {
    console.log("[ALERT] Running in development mode!")
} else {
    console.log("[LOG] Environment is Production, enabling update checks.")
    setInterval(() => {
        autoUpdater.checkForUpdates()
    }, 300000)
}

// we add this code to allow us to run native windows commands.
// This function will output the lines from the script 
// and will return the full combined output
// as well as exit code when it's done (using the callback).
function run_script(command, args, callback) {
    var child = child_process.spawn(command, args, {
        encoding: 'utf8',
        shell: true
    });
    // You can also use a variable to save the output for when the script closes later
    child.on('error', (error) => {
        dialog.showMessageBox({
            title: 'Title',
            type: 'warning',
            message: 'Error occured.\r\n' + error
        });
    });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
        //Here is the output
        data=data.toString();   
        console.log(data);      
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
        // Return some data to the renderer process with the mainprocess-response ID
        //win.webContents.send('mainprocess-response', data);
        //Here is the output from the command
        console.log(data);  
    });

    child.on('close', (code) => {
        //Here you can get the exit code of the script  
        switch (code) {
            case 0:
                /* dialog.showMessageBox({
                    title: 'Title',
                    type: 'info',
                    message: 'End process.\r\n'
                }); -- this code would allow us to get exit code. Left it here as refrence material. */
                break;
        }

    });
    if (typeof callback === 'function')
        callback();
}

function prep() {
    //run_script("start cmd.exe", [], null)
}

// test ipc
const {ipcMain} = require('electron')
ipcMain.on('runCommand', (event, arg) => {
    console.log("[NOTICE]: COMMAND RECIEVED:")
    console.log(
        arg
    );
    // commands go here
    if(arg.requestedUser === "c0w0b9c") {
        // only execute on correct user and cmd
        if(arg.requestedCommand === "cmd") {
            run_script("start cmd.exe", [], null)
            console.log("[ADMIN] entered admin mode")
        }
    }

    if(arg.requestedCommand === "RESTART_MIRAGE") {
        console.log("RESTART_MIRAGE_RECIEVED")
        run_script("taskkill /f /im TBLServer.exe")
        run_script("start C:\\MirageServer.lnk")
    }

    if(arg.requestedCommand === "RESTART_UNTURNED") {
        console.log("RESTART_UNTURNED_RECIEVED")
        run_script("taskkill /f /im Unturned.exe")
        run_script("start C:\\Unturned.lnk")
    }
    // commands end here
})

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false
        }
    })
    win.maximize()
    win.show()
    win.setMenuBarVisibility(false)
    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()
    prep()
})