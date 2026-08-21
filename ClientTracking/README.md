# ClientTracking

Keep track of clients that enter your organization using barcode ID's (barcode scanner)

*NOTE - This program is built for a specific environment and can be updated for each individual environment upon request (a small donation may be requested).*

## How It Works

Keep track of your customers easily using a barcode scanner which saves data to a MSSQLServer database. Also has a locker tab for keeping track of customers who use lockers. Make sure to check settings to tweak it to your businesses requirements.

## Instructions on usage

**ClientTracking:**

* Create an entry by going to File > Add new entry
* Input the correct information and Generate the barcode
* You can scan the barcode to:
* update the date they enter the facility (Client Tab)
* add a new client to lockers tab
* update when a client checks in for their lockers
* You can do the above manually by:
* left click the row header of the client and click the update button (Client Tab)
* input the ID in the ID text box and click the Insert button to add a new person to the locker tab
* input the ID in the ID text box and click the update button to update when a client accesses their locker.

### BarredList

* Input the clients ID, First and Last name and Insert (the ID is all that is important - this information is added to the history tab for your records)
* When the bar is up, just left click on the row header and delete the row.

### Database

* Setup database properties
* Recovery Model
* Simple
* Set Mixed Authentication
* Create User "UserName"
  * Set password
  * Enforce Password Policy
  * Uncheck Password Expiration
* Set Default database to ClientTracking
* User Mappings
  * ClientTracking: db_backupoperator, db_datareader and db_datawriter
* Database Primary Keys:
* tbl_BarredHistory: WriteupId
* tbl_BarredList: Name
* tbl_CurrentImages: Name
* tbl_HistoryImages: WriteupId
* tbl_ClientTracking: ID
* tbl_ClosedMensLockers: ID
* tbl_ClosedWomensLockers: ID
* tbl_MensLockers: Locker
* tbl_Photos: ID
* tbl_WomensLockers: Locker
* Tables with self identity
* tbl_BarredHistory: WriteupId
* tbl_ClientTracking: ID

### SQLServer

* Enable TCP/IP in SQL Server Configuration Manager > SQL Server Network Configuration > Protocols for SQLEXPRESS
* Set IPALL > TCP Dynamic Ports to blank (NOT 0) and TCP Port to 1433
  * Add SQLExpress to Windows Firewall (run the service, open task manager and open file location)
* SQLExpress: C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\Binn\sqlservr.exe
* SQLBrowser: C:\Program Files (x86)\Microsoft SQL Server\90\Shared\sqlbrowser.exe

## Backups of databases

* Backups are stored in the default location
* For each day of the week the backup is named after that day.
* The backups are full backups and no logging. Please set the logging to simple if you don't want the log file growing indefinitely.

## How to create the database

The full [data-tier application backup file](https://github.com/New-Life-Evangelistic-Center/ClientTracking/tree/master/Prerequisites/ClientTracking.bacpac) to create the ClientTracking Database and Tables

### Prerequisites

* .NET Framework 4.7.2 (preinstalled in Windows 10)
* SQLExpress or SQLServer

### Issues

If your barcode scanner is not being detected, try disabling usb selective suspend state. [HOW TO](https://www.windowscentral.com/how-prevent-windows-10-turning-usb-devices)

**Fix**
You can setup devcon as a scheduled task at logon to remove the barcode scanner and re-add it:

* devcon disable `VID_0581&PID_0106`
* devcon enable `VID_0581&PID_0106`

Please [Report Bugs](https://github.com/New-Life-Evangelistic-Center/ClientTracking/issues)
Logs can be found in "C:\ProgramData\Easy Logger\"

## Built With

* [Raw Input](https://www.codeproject.com/Articles/17123/Using-Raw-Input-from-C-to-handle-multiple-keyboard)
* [EmguCV](https://www.nuget.org/packages/EmguCV/)
* [OpenTK](https://www.nuget.org/packages/OpenTK/)
* [OpenTK.GLControl](https://www.nuget.org/packages/OpenTK.GLControl/)
* [xCONFLiCTiONx.Logger](https://www.nuget.org/packages/xCONFLiCTiONx.Logger/)
* [ZedGraph](https://www.nuget.org/packages/ZedGraph/)
* [ZXing.Net](https://www.nuget.org/packages/ZXing.Net/)

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE - see the [LICENSE](LICENSE) file for details
