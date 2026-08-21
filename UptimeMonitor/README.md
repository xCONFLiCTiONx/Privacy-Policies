# UptimeMonitor

A lightweight Windows console application designed to monitor system uptime and report status to a remote server.

## Features
- **Uptime Monitoring**: Tracks the duration the system has been active.
- **Automated Reporting**: Periodically uploads status files to a configured FTP/SFTP server.
- **Quiet Time Scheduling**: Allows users to define specific windows during which status updates are paused.
- **Logging**: Integrates with EasyLogger for detailed activity and error logging.

## Components
- **UptimeMonitor.exe**: The main console application.
- **UptimeMonitor.php**: A server-side script for receiving or displaying status.
- **settings.cfg**: Local configuration for quiet time and other parameters.

## Prerequisites
- .NET Framework
- FTP/SFTP Server access
- WinSCP .NET Assembly
