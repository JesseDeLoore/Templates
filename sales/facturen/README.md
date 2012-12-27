Invoicing
==========
The invoicing system for the sales app is comprised of a set of complex 
templates. For that reason, this file contains a short description of the 
various files used, and how they interact.

Controllers
-----------
These files are basically the bridges between various formats
- *CxProjects4Invoices.html* selects the required invoices using CxScript
- *CxProjects2JSONInvoices.js* transforms the invoices selected using earlier 
  into JavaScript Invoice objects (see Models)
- *template.js* is a jQuery wrapper around John Resig's microtemplating engine  

Models
------
The models folder contains extensions to JavaScript and/or jQuery that are 
usefull somewhere in the templates.
- *CxSystem.js* is included as a parsed template, that is, will be run through
  the CxScript parser. It creates a CxUser object, which can be easily 
  referenced for the purpose of obtaining session based information such as 
  userID, the appname and the xmlPassword.
- *Invoice.js* defines an Invoice object, which basically extends a simple 
  javascript model with methods to calculate Subtotal, VAT-amount and Total 
  amount for the invoice.
- *jsObjectExtensions.js* extends the JavaScript Date and String object's 
  prototype. The Date object gains getTranslatedMonthName, previousMonth, 
  nextMonth and various predefined print formats. String gains base64encode and
  base64decode (both multibyte safe) functionality.
- *jquery.actual.min.js* is a (fairly default) jquery plugin which allows for
  determining the actual size of a container, instead of the current size. The
  difference is in that when retrieving the height of a hidden object, jQuery
  always returns 0, while actual will return the height as if it were visible.
  
Pages
-----
If this were an MVC build application, pages would be the views. They contain
all information about how a certain parts should look like. They come in three
types
  
### js
These are the pages that are available from the overview menu. They contain 
the JavaScript to show additional information as well as callbacks for creating
mails, downloading PDF's and updating invoice numbers, among others.
- *invoices.js* creates all invoices by calling the invoice.html template 
- *export.js* handles the creation of a textarea containing the .tsv file for
  the created invoices 
- *mail.js* creates a table containing a row per invoice, from where the 
  invoice can be downloaded as PDF and/or mailed to the relevant carerix user.
  Sending all invoices in bulk is also available.

### html
The HTML pages contain actual templates, either for use as CxScript, or 
through the use of John Resig's micro templating language.
- *controle.html* is a CxScript template which shows all invoices that should
  be created and displays them split into 3 categories: fine, warning and 
  error.
- *invoice.html* is a JavaScript template for how each invoice should look. It
  is also used as attachment to the mail that will be send.
- *mail.html* is similar to invoice.html in that it contains the content of the
  mail.

### css
No real explanation needed here, I hope.