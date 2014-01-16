SoundsLike-Frontend
===================

The SoundsLike prototype sources (HTML 5 project). 

The system is composed by three tiers or layers: presentation tier, logic tier and data tier. This repository holds the SoundsLike front-end that fits in the presentation tier of the system.

[Go here for the webservice and database](https://github.com/Semogj/SoundsLike-Virus-Webservice)

##Context

This work is associated to the VIRUS - “Video Information Retrieval Using Subtitles” (Langlois et al., 2010)  academic research project (http://virus.di.fc.ul.pt) and elaborated as a final project of  the Computer Science Engineering Master course of Faculty of Sciences, University of Lisbon, in the context of the HCIM group at LaSIGE, FCUL.

The SoundsLike Prototype
===================

SoundsLike is a prototype which is integrated directly as a part of MovieClouds for the
purpose of classifying and browsing movies’ soundtracks.

It provides an interface for
interactive navigation and labelling of audio excerpts, integrating game elements to induce
and support users to contribute for this task, by allowing and simplifying listening to the
audio on the context of the movie and presenting similar audios and suggesting labels. It
aims to provide overviews or summaries of the audio and indexing mechanisms to access
the video moments containing audio events (e.g. gun shots, animal noises, shouting, etc.)
and mood to users. To identify such events, it requires statistical models that rely on
databases of existing labelled data.

However, such databases that would be suitable for
this purpose are not available, and the building of new databases would require a massive
number of hours of listening and manual classification - the cold start problem.
It is desirable to look for other ways to collect such high quantities of information.
Therefore, a solution that consists on bringing the human into the processing loop of video
and audio through Gamification and a Human Computation approach was explored. This
approach is not a novelty, but it innovates upon these applications both in terms of entertainment aspects
and in terms of the definition of the game and the movie browsing in order to stimulate the
interest of the user in labelling audio excerpts inside the movies, allowing the collection
of data that will help solve the cold start problem for the classification of audio events.

Installation Instructions
=====================

##Requirements
* Apache HTTP server with PHP 5.3 or higher;
* MySQL 5.0 or higher;
* Mozilla Firefox 22 / Chrome 28 / Opera 13 / Internet Explorer 9 (untested!) or higher versions;

##Install Apache+Mysql+PHP (in linux):
Note: you will need superuser access.

1. Download XAMPP package installer for linux (from http://apachefriends.org);
  
 Note: as alternative you can install apache2, mysql and php packages from the repositories but you will need a lot more configurations!

2. Run the installer and follow the instructions;
   > chmod 755 xampp-linux-X.X.X-X-installer.run
   > sudo ./xampp-linux-X.X.X-X-installer.run

3. Start XAMPP. If you already have an application running in port 80, jump to step 4.
   > sudo /opt/lampp/lampp start

4. Change apache configuration, including the listening port;
   >Edit the file "/opt/lampp/etc/httpd.conf" with super user;
   
   Important config entries:
       > Listen <port> -> listening port.<br />
       > ServerRoot <location> -> server location (do not change it!).<br />
       > ServerAdmin <email> -> server admin email.<br />
       > ServerName <name> -> domain or ip. Usually guessed automatically.<br />
       > DocumentRoot <location> -> web files location, by default in "/opt/lampp/htdocs".

5. Improve security:
   > sudo /opt/lampp/lampp security <br />
   **IMPORTANT!!!!** ----> Take note of all inserted passwords, including MySQL root password.
                       **Do not leave mysql root user with an empty password!**	

6. Test: http://localhost/

###Info:

####START AND STOP PARAMETERS

- **start** - 	        Starts XAMPP. <br />
- **stop** -	        Stops XAMPP. <br />
- **restart** - 	Stops and starts XAMPP. <br />
- **startapache** - 	Starts only the Apache. <br />
- **startssl** -	Starts the Apache SSL support. This command activates the SSL support permanently,
                e.g. if you restarts XAMPP in the future SSL will stay activated.<br />
- **startmysql** -	Starts only the MySQL database.<br />
- **startftp** -	Starts the ProFTPD server. Via FTP you can upload files for your web server (user 
                "nobody", password "lampp"). This command activates the ProFTPD permanently,
                e.g. if you restarts XAMPP in the future FTP will stay activated.<br />
- **stopapache** - 	Stops the Apache.<br />
- **stopssl** -	Stops the Apache SSL support. This command deactivates the SSL support permanently,
                e.g. if you restarts XAMPP in the future SSL will stay deactivated.<br />
- **stopmysql** - 	Stops the MySQL database.<br />
- **stopftp** - 	Stops the ProFTPD server. This command deactivates the ProFTPD permanently,
                e.g. if you restarts XAMPP in the future FTP will stay deactivated.<br />
- **security** -	Starts a small security check programm. <br />

####IMPORTANT FILES AND DIRECTORIES

**File/Directory** - **Purpose**<br />
- **/opt/lampp/bin/** - The XAMPP commands home. /opt/lampp/bin/mysql calls for example the MySQL monitor.<br />
- **/opt/lampp/htdocs/** - The Apache DocumentRoot directory.<br />
- **/opt/lampp/etc/httpd.conf** - The Apache configuration file.<br />
- **/opt/lampp/etc/my.cnf** - The MySQL configuration file.<br />
- **/opt/lampp/etc/php.ini** - The PHP configuration file.<br />
- **/opt/lampp/etc/proftpd.conf** - The ProFTPD configuration file. (since 0.9.5)<br />
- **/opt/lampp/phpmyadmin/config.inc.php** - The phpMyAdmin configuration file.<br />

##Installing SoundsLike

>**Note**: I am assuming that the DocumentRoot is "/opt/lampp/htdocs"

>**Note2**: If you don't like to do file operation in the linux terminal run the following command:
>> (gnome - e.g. linux ubuntu) > gksudo nautilus<br />
>> (mate - e.g. linux mint) > gksudo caja<br />
>> (other) > gksudo <yourFileManagerNameHere>

Obtain the virus webservice package, soundslike frontend package and database SQL file: [here](https://github.com/Semogj/SoundsLike-Virus-Webservice)


##Install Database

1. Go to http://localhost/phpmyadmin/ ;
2. Use "root" as username and the respective password set previously on the security step 
(If you did not change it, the default is empty. For this case I advice you to change it!);

3. Create a new database called "virus-data";

4. Go to "Users" tab;
5. Add a new database user called "virus", host "localhost", a custom password and NO custom privileges;
6. Edit "virus" user previleges, in the "Database-specific privileges" add access to the database "virus-data"
   by using the available dropbox and give all previleges (or just "data" previleges);
NOTE: If you want a improved security, only give "Data" manipulation previleges and user root for changing
 database structure and other administrative changes.
7. Select database "virus-data" in the left panel displaying a database list.
8. Go to the "Import" tab;
9. Select the database SQL file by clicking the "browse" button and click "Go";
Note: in case of error due size file, try compress to a zip and import, 
otherwise you will have to use mysql console or a software like navicat.		
10. Database config is done. Remember the database user and password for this database.

##Install Virus Webservice

1. Obtain the virus webservice package (checkout the code from [here](https://github.com/Semogj/SoundsLike-Virus-Webservice));
2. Unpack the virus webservice package. 
   Move the contents of the folder "webservice" to "/opt/lampp/htdocs/virus-webservice";
3. Edit "/opt/lampp/htdocs/virus-webservice/index.php".
Find the configuration array and change the following entries:<br />
> 'dbUser' => 'virus',<br />
> 'dbPassword' => '<YourPasswordConfiguredBefore>',<br />
> 'dbName' => 'virus-data',<br />
**NOTE:** later I advice you to change debug to false. <br />

The webservice will log everything to "/opt/lampp/htdocs/virus-webservice/logs/"

4. Open http://localhost/virus-webservice/
5. If displays error relative the opening of log files run the following commands:
 > sudo chgrp -R nogroup /opt/lampp/htdocs/<br />
 > sudo chmod -R 770 "/opt/lampp/htdocs/virus-webservice/"<br />

 **Note**: apache process operates under the user "nobody" and group "nogroup". You need give
      proper permissions for apache being able to create files inside htdocs.

6. Test again. In case of error, check the permissions again (or use chmod 777 on "logs" directory,
   but introduces a security fault)
7. Test "http://localhost/virus-webservice/index.php/apiv1/video"
8. Webservice configuration done!

##Install SoundsLike:

1. Obtain the soundslike frontend package (checkout the source from the repository);
2. Unpack the soundslike package (if zipped).  <br />
   Move the contents of the folder "public_html" to "/opt/lampp/htdocs/soundslike";
3. Edit "/opt/lampp/htdocs/soundslike/index.html". <br />
 Find "var api = new MovieCloudsApi(" and add the webservice url. <br />
   Webservice url is "http://localhost/virus-webservice/index.php/"



