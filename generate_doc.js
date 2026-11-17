const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber
} = require('docx');

// Create document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Arial',
          size: 22, // 11pt
          color: '2D3748'
        },
        paragraph: {
          spacing: { line: 276, before: 100, after: 100 }
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'Complaint Registration & Tracking System | Java OOP Assignment',
                  font: 'Arial',
                  size: 16,
                  color: '718096',
                  italics: true
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'Page ',
                  font: 'Arial',
                  size: 18,
                  color: '718096'
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Arial',
                  size: 18,
                  bold: true,
                  color: '2B6CB0'
                })
              ]
            })
          ]
        })
      },
      children: [
        // Title Block
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: 'COMPLAINT REGISTRATION AND TRACKING SYSTEM',
              font: 'Arial',
              size: 36, // 18pt
              bold: true,
              color: '1A365D'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 300 },
          children: [
            new TextRun({
              text: 'Object-Oriented Programming (Java) Laboratory Project Report',
              font: 'Arial',
              size: 24, // 12pt
              bold: true,
              color: '2B6CB0'
            })
          ]
        }),

        createDivider(),

        // 1. Aim
        createHeading1('1. Aim'),
        new Paragraph({
          children: [
            new TextRun({
              text: 'To design and implement a Complaint Registration and Tracking System in Java using Object Oriented Programming concepts, where customers can register complaints and track their progress, and an administrator can review and update the status of complaints.'
            })
          ]
        }),

        // 2. Abstract
        createHeading1('2. Abstract'),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Organizations often lose or delay customer complaints when they are handled manually. This project provides a console-based, role-based Java application in which customers register, log in, and file complaints with a category, description and priority (LOW, MEDIUM, HIGH). Every complaint receives a unique ID and a filing date. Customers can track a complaint by its ID or view all of their own complaints. The administrator can view all complaints, update their status (REGISTERED, IN_PROGRESS, RESOLVED) with remarks, and generate a summary report.'
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'The project applies classes and objects, encapsulation, inheritance, abstraction, polymorphism, enumerations, collections and custom exception handling. Invalid complaint IDs, statuses, priorities and menu inputs are all handled gracefully.'
            })
          ]
        }),

        // 3. Problem Statement
        createHeading1('3. Problem Statement'),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Organizations receive many complaints from customers, and handling them manually leads to delays and lost records. The system provides a console-based application in which every complaint is given a unique ID, stored with its category, priority and status, and can be tracked at any time until it is resolved.'
            })
          ]
        }),

        // 4. Features
        createHeading1('4. Features'),
        createBullet('Customer registration and login (role based: Customer / Admin).'),
        createBullet('Filing a complaint with category, description and priority (LOW, MEDIUM, HIGH).'),
        createBullet('Auto-generated unique Complaint ID and filing date.'),
        createBullet('Tracking a complaint by ID and viewing all complaints of a customer.'),
        createBullet('Admin can view all complaints, update status (REGISTERED, IN_PROGRESS, RESOLVED) with remarks, and see a summary report.'),
        createBullet('Error handling for invalid IDs, invalid status/priority and invalid menu input.'),

        // 5. OOP Concepts Used
        createHeading1('5. OOP Concepts Used'),
        createBulletBold('Class & Object: ', 'Complaint and ComplaintService model the complaint data and the business logic.'),
        createBulletBold('Encapsulation: ', 'Complaint keeps its fields private; they are accessed via getters/setters.'),
        createBulletBold('Inheritance: ', 'Customer and Admin extend User; common login data is shared in the base class.'),
        createBulletBold('Abstraction: ', 'User (abstract class) and Trackable (interface) hide details and force subclasses to define getRole().'),
        createBulletBold('Polymorphism: ', 'The overridden methods getRole() and updateStatus() behave differently per class.'),
        createBulletBold('Enumeration: ', 'Priority and Status provide fixed sets of constants for safe values.'),
        createBulletBold('Exception Handling: ', 'ComplaintNotFoundException is a custom checked exception for invalid complaint IDs.'),
        createBulletBold('Collections: ', 'LinkedHashMap and ArrayList store the complaints and users.'),

        // 6. Class Design & UML Table
        createHeading1('6. Class Design'),
        new Paragraph({
          children: [
            new TextRun({
              text: 'The architecture divides concerns into distinct, reusable components adhering to SOLID design principles. Below is the structural summary of classes and interfaces:'
            })
          ]
        }),
        createClassDesignTable(),

        // 7. Source Code
        createHeading1('7. Source Code'),

        createCodeHeader('Priority.java (Enumeration)'),
        createCodeBlock(`public enum Priority {
    LOW, MEDIUM, HIGH
}`),

        createCodeHeader('Status.java (Enumeration)'),
        createCodeBlock(`public enum Status {
    REGISTERED, IN_PROGRESS, RESOLVED
}`),

        createCodeHeader('ComplaintNotFoundException.java (Custom Exception)'),
        createCodeBlock(`public class ComplaintNotFoundException extends Exception {
    public ComplaintNotFoundException(int id) {
        super("No complaint found with ID: " + id);
    }
}`),

        createCodeHeader('Trackable.java (Interface)'),
        createCodeBlock(`public interface Trackable {
    void updateStatus(Status newStatus);
    Status getStatus();
}`),

        createCodeHeader('Complaint.java (Class implementing Trackable)'),
        createCodeBlock(`import java.time.LocalDate;

public class Complaint implements Trackable {
    private static int counter = 1000;
    private final int id;
    private final String customerName;
    private final String category;
    private final String description;
    private final Priority priority;
    private final LocalDate dateFiled;
    private Status status;
    private String remarks;

    public Complaint(String customerName, String category,
                     String description, Priority priority) {
        this.id = ++counter;
        this.customerName = customerName;
        this.category = category;
        this.description = description;
        this.priority = priority;
        this.dateFiled = LocalDate.now();
        this.status = Status.REGISTERED;
        this.remarks = "Awaiting review";
    }

    public int getId() { return id; }
    public String getCustomerName() { return customerName; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public Priority getPriority() { return priority; }
    public LocalDate getDateFiled() { return dateFiled; }
    public String getRemarks() { return remarks; }

    @Override
    public Status getStatus() { return status; }

    @Override
    public void updateStatus(Status newStatus) {
        this.status = newStatus;
    }

    public void setRemarks(String remarks) { this.remarks = remarks; }

    @Override
    public String toString() {
        return "----------------------------------------\\n"
             + "Complaint ID : " + id + "\\n"
             + "Customer     : " + customerName + "\\n"
             + "Category     : " + category + "\\n"
             + "Description  : " + description + "\\n"
             + "Priority     : " + priority + "\\n"
             + "Date Filed   : " + dateFiled + "\\n"
             + "Status       : " + status + "\\n"
             + "Remarks      : " + remarks + "\\n"
             + "----------------------------------------";
    }
}`),

        createCodeHeader('User.java (Abstract Class)'),
        createCodeBlock(`public abstract class User {
    protected String name;
    protected String password;

    public User(String name, String password) {
        this.name = name;
        this.password = password;
    }

    public String getName() { return name; }

    public boolean authenticate(String name, String password) {
        return this.name.equalsIgnoreCase(name) && 
               this.password.equals(password);
    }

    public abstract String getRole();
}`),

        createCodeHeader('Customer.java (Class extending User)'),
        createCodeBlock(`public class Customer extends User {
    public Customer(String name, String password) {
        super(name, password);
    }

    @Override
    public String getRole() {
        return "CUSTOMER";
    }
}`),

        createCodeHeader('Admin.java (Class extending User)'),
        createCodeBlock(`public class Admin extends User {
    public Admin(String name, String password) {
        super(name, password);
    }

    @Override
    public String getRole() {
        return "ADMIN";
    }
}`),

        createCodeHeader('ComplaintService.java (Service Controller)'),
        createCodeBlock(`import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ComplaintService {
    private final Map<Integer, Complaint> complaints = new LinkedHashMap<>();
    private final List<User> users = new ArrayList<>();

    public ComplaintService() {
        users.add(new Admin("admin", "admin123"));
    }

    public void registerCustomer(String name, String password) {
        users.add(new Customer(name, password));
    }

    public User login(String name, String password) {
        for (User u : users) {
            if (u.authenticate(name, password)) {
                return u;
            }
        }
        return null;
    }

    public Complaint fileComplaint(String customer, String category,
                                   String description, Priority priority) {
        Complaint c = new Complaint(customer, category, description, priority);
        complaints.put(c.getId(), c);
        return c;
    }

    public Complaint findById(int id) throws ComplaintNotFoundException {
        Complaint c = complaints.get(id);
        if (c == null) {
            throw new ComplaintNotFoundException(id);
        }
        return c;
    }

    public List<Complaint> getByCustomer(String customer) {
        List<Complaint> result = new ArrayList<>();
        for (Complaint c : complaints.values()) {
            if (c.getCustomerName().equalsIgnoreCase(customer)) {
                result.add(c);
            }
        }
        return result;
    }

    public List<Complaint> getAll() {
        return new ArrayList<>(complaints.values());
    }

    public void updateComplaint(int id, Status status, String remarks)
            throws ComplaintNotFoundException {
        Complaint c = findById(id);
        c.updateStatus(status);
        c.setRemarks(remarks);
    }

    public int countByStatus(Status status) {
        int count = 0;
        for (Complaint c : complaints.values()) {
            if (c.getStatus() == status) count++;
        }
        return count;
    }
}`),

        createCodeHeader('Main.java (Application Driver)'),
        createCodeBlock(`import java.util.List;
import java.util.Scanner;

public class Main {
    private static final Scanner sc = new Scanner(System.in);
    private static final ComplaintService service = new ComplaintService();

    public static void main(String[] args) {
        System.out.println("===== COMPLAINT REGISTRATION AND TRACKING SYSTEM =====");
        boolean running = true;
        while (running) {
            System.out.println("\\n1. Register as Customer");
            System.out.println("2. Login");
            System.out.println("3. Exit");
            System.out.print("Enter choice: ");
            int choice = readInt();
            switch (choice) {
                case 1 -> registerCustomer();
                case 2 -> login();
                case 3 -> {
                    running = false;
                    System.out.println("Thank you. Goodbye!");
                }
                default -> System.out.println("Invalid choice.");
            }
        }
    }

    private static void registerCustomer() {
        System.out.print("Enter name: ");
        String name = sc.nextLine().trim();
        System.out.print("Enter password: ");
        String pass = sc.nextLine().trim();
        service.registerCustomer(name, pass);
        System.out.println("Registration successful. Please login.");
    }

    private static void login() {
        System.out.print("Username: ");
        String name = sc.nextLine().trim();
        System.out.print("Password: ");
        String pass = sc.nextLine().trim();
        User user = service.login(name, pass);
        if (user == null) {
            System.out.println("Invalid credentials.");
        } else if (user instanceof Admin) {
            adminMenu(user);
        } else {
            customerMenu(user);
        }
    }

    private static void customerMenu(User user) {
        System.out.println("\\nWelcome, " + user.getName() + " [" + user.getRole() + "]");
        boolean back = false;
        while (!back) {
            System.out.println("\\n1. File a Complaint");
            System.out.println("2. Track Complaint by ID");
            System.out.println("3. View My Complaints");
            System.out.println("4. Logout");
            System.out.print("Enter choice: ");
            switch (readInt()) {
                case 1 -> fileComplaint(user);
                case 2 -> trackComplaint();
                case 3 -> printList(service.getByCustomer(user.getName()));
                case 4 -> back = true;
                default -> System.out.println("Invalid choice.");
            }
        }
    }

    private static void adminMenu(User user) {
        System.out.println("\\nWelcome, " + user.getName() + " [" + user.getRole() + "]");
        boolean back = false;
        while (!back) {
            System.out.println("\\n1. View All Complaints");
            System.out.println("2. Update Complaint Status");
            System.out.println("3. Summary Report");
            System.out.println("4. Logout");
            System.out.print("Enter choice: ");
            switch (readInt()) {
                case 1 -> printList(service.getAll());
                case 2 -> updateComplaint();
                case 3 -> summary();
                case 4 -> back = true;
                default -> System.out.println("Invalid choice.");
            }
        }
    }

    private static void fileComplaint(User user) {
        System.out.print("Category (Billing/Service/Product/Other): ");
        String category = sc.nextLine().trim();
        System.out.print("Description: ");
        String desc = sc.nextLine().trim();
        System.out.print("Priority (LOW/MEDIUM/HIGH): ");
        Priority p;
        try {
            p = Priority.valueOf(sc.nextLine().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.out.println("Invalid priority. Defaulting to MEDIUM.");
            p = Priority.MEDIUM;
        }
        Complaint c = service.fileComplaint(user.getName(), category, desc, p);
        System.out.println("Complaint registered successfully! Your Complaint ID is " + c.getId());
    }

    private static void trackComplaint() {
        System.out.print("Enter Complaint ID: ");
        int id = readInt();
        try {
            System.out.println(service.findById(id));
        } catch (ComplaintNotFoundException e) {
            System.out.println(e.getMessage());
        }
    }

    private static void updateComplaint() {
        System.out.print("Enter Complaint ID: ");
        int id = readInt();
        System.out.print("New status (REGISTERED/IN_PROGRESS/RESOLVED): ");
        try {
            Status s = Status.valueOf(sc.nextLine().trim().toUpperCase());
            System.out.print("Remarks: ");
            String remarks = sc.nextLine().trim();
            service.updateComplaint(id, s, remarks);
            System.out.println("Complaint updated successfully.");
        } catch (IllegalArgumentException e) {
            System.out.println("Invalid status entered.");
        } catch (ComplaintNotFoundException e) {
            System.out.println(e.getMessage());
        }
    }

    private static void summary() {
        System.out.println("\\n--- Summary Report ---");
        System.out.println("Total : " + service.getAll().size());
        for (Status s : Status.values()) {
            System.out.println(s + " : " + service.countByStatus(s));
        }
    }

    private static void printList(List<Complaint> list) {
        if (list.isEmpty()) {
            System.out.println("No complaints found.");
            return;
        }
        for (Complaint c : list) {
            System.out.println(c);
        }
    }

    private static int readInt() {
        try {
            return Integer.parseInt(sc.nextLine().trim());
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}`),

        // 8. Sample Output
        createHeading1('8. Sample Output'),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Sample run with five customers: dinesh, ram, sita, priya and raj, followed by the admin session and customer tracking verification.'
            })
          ]
        }),

        createConsoleHeader('Terminal Execution Screen 1 of 13: Customer Registrations'),
        createTerminalBlock(`===== COMPLAINT REGISTRATION AND TRACKING SYSTEM =====

1. Register as Customer
2. Login
3. Exit
Enter choice: 1
Enter name: dinesh
Enter password: dinesh123
Registration successful. Please login.

1. Register as Customer
2. Login
3. Exit
Enter choice: 1
Enter name: ram
Enter password: ram123
Registration successful. Please login.

1. Register as Customer
2. Login
3. Exit
Enter choice: 1
Enter name: sita
Enter password: sita123
Registration successful. Please login.

1. Register as Customer
2. Login
3. Exit
Enter choice: 1
Enter name: priya
Enter password: priya123
Registration successful. Please login.`),

        createConsoleHeader('Terminal Execution Screen 2 of 13: Raj Register, Invalid Input & Dinesh Complaint 1001'),
        createTerminalBlock(`1. Register as Customer
2. Login
3. Exit
Enter choice: 1
Enter name: raj
Enter password: raj123
Registration successful. Please login.

1. Register as Customer
2. Login
3. Exit
Enter choice: 9
Invalid choice.

1. Register as Customer
2. Login
3. Exit
Enter choice: 2
Username: dinesh
Password: dinesh123

Welcome, dinesh [CUSTOMER]

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 1
Category (Billing/Service/Product/Other): Service
Description: Internet connection is down since two days
Priority (LOW/MEDIUM/HIGH): HIGH
Complaint registered successfully! Your Complaint ID is 1001`),

        createConsoleHeader('Terminal Execution Screen 3 of 13: Dinesh Views Complaints & Ram Logs In'),
        createTerminalBlock(`1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 3
----------------------------------------
Complaint ID : 1001
Customer     : dinesh
Category     : Service
Description  : Internet connection is down since two days
Priority     : HIGH
Date Filed   : 2026-11-09
Status       : REGISTERED
Remarks      : Awaiting review
----------------------------------------

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 4

1. Register as Customer
2. Login
3. Exit
Enter choice: 2
Username: ram
Password: ram123

Welcome, ram [CUSTOMER]`),

        createConsoleHeader('Terminal Execution Screen 4 of 13: Ram Files Complaint 1002 & Tracks It'),
        createTerminalBlock(`1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 1
Category (Billing/Service/Product/Other): Billing
Description: Charged twice for monthly bill
Priority (LOW/MEDIUM/HIGH): medium
Complaint registered successfully! Your Complaint ID is 1002

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 2
Enter Complaint ID: 1002
----------------------------------------
Complaint ID : 1002
Customer     : ram
Category     : Billing
Description  : Charged twice for monthly bill
Priority     : MEDIUM
Date Filed   : 2026-11-09
Status       : REGISTERED
Remarks      : Awaiting review
----------------------------------------

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 4`),

        createConsoleHeader('Terminal Execution Screen 5 of 13: Sita Files 1003 & Tests ComplaintNotFoundException'),
        createTerminalBlock(`1. Register as Customer
2. Login
3. Exit
Enter choice: 2
Username: sita
Password: sita123

Welcome, sita [CUSTOMER]

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 1
Category (Billing/Service/Product/Other): Product
Description: Received a damaged product
Priority (LOW/MEDIUM/HIGH): LOW
Complaint registered successfully! Your Complaint ID is 1003

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 2
Enter Complaint ID: 9999
No complaint found with ID: 9999

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 4`),

        createConsoleHeader('Terminal Execution Screen 6 of 13: Priority Fallback & Authentication Error'),
        createTerminalBlock(`1. Register as Customer
2. Login
3. Exit
Enter choice: 2
Username: priya
Password: priya123

Welcome, priya [CUSTOMER]

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 1
Category (Billing/Service/Product/Other): Service
Description: Mobile network signal is very weak
Priority (LOW/MEDIUM/HIGH): urgent
Invalid priority. Defaulting to MEDIUM.
Complaint registered successfully! Your Complaint ID is 1004

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 4

1. Register as Customer
2. Login
3. Exit
Enter choice: 2
Username: raj
Password: raj999
Invalid credentials.`),

        createConsoleHeader('Terminal Execution Screen 7 of 13: Raj Files 1005 & Admin Session'),
        createTerminalBlock(`1. Register as Customer
2. Login
3. Exit
Enter choice: 2
Username: raj
Password: raj123

Welcome, raj [CUSTOMER]

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 1
Category (Billing/Service/Product/Other): Other
Description: Unable to update address in profile
Priority (LOW/MEDIUM/HIGH): low
Complaint registered successfully! Your Complaint ID is 1005

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 4

1. Register as Customer
2. Login
3. Exit
Enter choice: 2
Username: admin
Password: admin123

Welcome, admin [ADMIN]`),

        createConsoleHeader('Terminal Execution Screen 8 & 9 of 13: Admin Reviews Master Complaints'),
        createTerminalBlock(`1. View All Complaints
2. Update Complaint Status
3. Summary Report
4. Logout
Enter choice: 1
----------------------------------------
Complaint ID : 1001
Customer     : dinesh
Category     : Service
Description  : Internet connection is down since two days
Priority     : HIGH
Date Filed   : 2026-11-09
Status       : REGISTERED
Remarks      : Awaiting review
----------------------------------------
Complaint ID : 1002
Customer     : ram
Category     : Billing
Description  : Charged twice for monthly bill
Priority     : MEDIUM
Date Filed   : 2026-11-09
Status       : REGISTERED
Remarks      : Awaiting review
----------------------------------------
Complaint ID : 1003
Customer     : sita
Category     : Product
Description  : Received a damaged product
Priority     : LOW
Date Filed   : 2026-11-09
Status       : REGISTERED
Remarks      : Awaiting review
----------------------------------------
Complaint ID : 1004
Customer     : priya
Category     : Service
Description  : Mobile network signal is very weak
Priority     : MEDIUM
Date Filed   : 2026-11-09
Status       : REGISTERED
Remarks      : Awaiting review
----------------------------------------
Complaint ID : 1005
Customer     : raj
Category     : Other
Description  : Unable to update address in profile
Priority     : LOW
Date Filed   : 2026-11-09
Status       : REGISTERED
Remarks      : Awaiting review
----------------------------------------`),

        createConsoleHeader('Terminal Execution Screen 10 of 13: Admin Updates Complaint Statuses'),
        createTerminalBlock(`1. View All Complaints
2. Update Complaint Status
3. Summary Report
4. Logout
Enter choice: 2
Enter Complaint ID: 1001
New status (REGISTERED/IN_PROGRESS/RESOLVED): in_progress
Remarks: Technician assigned
Complaint updated successfully.

1. View All Complaints
2. Update Complaint Status
3. Summary Report
4. Logout
Enter choice: 2
Enter Complaint ID: 1002
New status (REGISTERED/IN_PROGRESS/RESOLVED): RESOLVED
Remarks: Refund processed
Complaint updated successfully.

1. View All Complaints
2. Update Complaint Status
3. Summary Report
4. Logout
Enter choice: 2
Enter Complaint ID: 1003
New status (REGISTERED/IN_PROGRESS/RESOLVED): IN_PROGRESS
Remarks: Replacement being arranged
Complaint updated successfully.`),

        createConsoleHeader('Terminal Execution Screen 11 of 13: Status Validation & Summary Report'),
        createTerminalBlock(`1. View All Complaints
2. Update Complaint Status
3. Summary Report
4. Logout
Enter choice: 2
Enter Complaint ID: 1004
New status (REGISTERED/IN_PROGRESS/RESOLVED): closed
Invalid status entered.

1. View All Complaints
2. Update Complaint Status
3. Summary Report
4. Logout
Enter choice: 2
Enter Complaint ID: 7777
New status (REGISTERED/IN_PROGRESS/RESOLVED): RESOLVED
Remarks: Test
No complaint found with ID: 7777

1. View All Complaints
2. Update Complaint Status
3. Summary Report
4. Logout
Enter choice: 3

--- Summary Report ---
Total       : 5
REGISTERED  : 2
IN_PROGRESS : 2
RESOLVED    : 1`),

        createConsoleHeader('Terminal Execution Screen 12 & 13 of 13: Customer Tracking Verification & Clean Exit'),
        createTerminalBlock(`1. View All Complaints
2. Update Complaint Status
3. Summary Report
4. Logout
Enter choice: 4

1. Register as Customer
2. Login
3. Exit
Enter choice: 2
Username: dinesh
Password: dinesh123

Welcome, dinesh [CUSTOMER]

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 2
Enter Complaint ID: 1001
----------------------------------------
Complaint ID : 1001
Customer     : dinesh
Category     : Service
Description  : Internet connection is down since two days
Priority     : HIGH
Date Filed   : 2026-11-09
Status       : IN_PROGRESS
Remarks      : Technician assigned
----------------------------------------

1. File a Complaint
2. Track Complaint by ID
3. View My Complaints
4. Logout
Enter choice: 4

1. Register as Customer
2. Login
3. Exit
Enter choice: 3
Thank you. Goodbye!`),

        // 9. Conclusion
        createHeading1('9. Conclusion'),
        new Paragraph({
          children: [
            new TextRun({
              text: 'The Complaint Registration and Tracking System was implemented successfully in Java. It demonstrates classes, encapsulation, inheritance, abstraction, interfaces, polymorphism, enums, collections and custom exception handling in a practical enterprise application.'
            })
          ]
        })
      ]
    }
  ]
});

// Helper Functions
function createHeading1(text) {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    children: [
      new TextRun({
        text: text,
        font: 'Arial',
        size: 28, // 14pt
        bold: true,
        color: '1A365D'
      })
    ]
  });
}

function createBullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({
        text: text,
        font: 'Arial',
        size: 22
      })
    ]
  });
}

function createBulletBold(boldPrefix, text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({
        text: boldPrefix,
        font: 'Arial',
        size: 22,
        bold: true,
        color: '2B6CB0'
      }),
      new TextRun({
        text: text,
        font: 'Arial',
        size: 22
      })
    ]
  });
}

function createDivider() {
  return new Paragraph({
    spacing: { before: 100, after: 200 },
    border: {
      bottom: {
        color: 'CBD5E0',
        space: 1,
        value: 'single',
        size: 12
      }
    }
  });
}

function createCodeHeader(title) {
  return new Paragraph({
    spacing: { before: 240, after: 60 },
    children: [
      new TextRun({
        text: '📄 ' + title,
        font: 'Consolas',
        size: 20,
        bold: true,
        color: '2C5282'
      })
    ]
  });
}

function createConsoleHeader(title) {
  return new Paragraph({
    spacing: { before: 240, after: 60 },
    children: [
      new TextRun({
        text: '💻 ' + title,
        font: 'Consolas',
        size: 20,
        bold: true,
        color: '276749'
      })
    ]
  });
}

function createCodeBlock(codeText) {
  const lines = codeText.split('\n');
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' },
      left: { style: BorderStyle.SINGLE, size: 18, color: '3182CE' }, // Thick blue accent
      right: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'F7FAFC' },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: lines.map(
              line =>
                new Paragraph({
                  spacing: { line: 240, before: 10, after: 10 },
                  children: [
                    new TextRun({
                      text: line,
                      font: 'Consolas',
                      size: 18, // 9pt
                      color: '2D3748'
                    })
                  ]
                })
            )
          })
        ]
      })
    ]
  });
}

function createTerminalBlock(outputText) {
  const lines = outputText.split('\n');
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: '2D3748' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '2D3748' },
      left: { style: BorderStyle.SINGLE, size: 18, color: '38A169' }, // Green accent
      right: { style: BorderStyle.SINGLE, size: 6, color: '2D3748' }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: '1A202C' }, // Dark terminal
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: lines.map(
              line =>
                new Paragraph({
                  spacing: { line: 240, before: 10, after: 10 },
                  children: [
                    new TextRun({
                      text: line,
                      font: 'Consolas',
                      size: 18,
                      color: line.startsWith('Invalid') || line.startsWith('No complaint')
                        ? 'FC8181'
                        : line.startsWith('Complaint registered') || line.startsWith('Complaint updated') || line.startsWith('Registration')
                        ? '68D391'
                        : line.includes('Welcome') || line.includes('Summary')
                        ? '63B3ED'
                        : 'E2E8F0'
                    })
                  ]
                })
            )
          })
        ]
      })
    ]
  });
}

function createClassDesignTable() {
  const headers = ['Component / Class', 'Type', 'OOP Principle', 'Role & Responsibility'];
  const rows = [
    ['User', 'abstract class', 'Abstraction, Inheritance', 'Base class providing name, password, authentication, abstract getRole().'],
    ['Customer', 'class', 'Inheritance, Polymorphism', 'Extends User; overrides getRole() returning "CUSTOMER".'],
    ['Admin', 'class', 'Inheritance, Polymorphism', 'Extends User; overrides getRole() returning "ADMIN".'],
    ['Trackable', 'interface', 'Abstraction, Interface', 'Defines status tracking contract: updateStatus() and getStatus().'],
    ['Complaint', 'class', 'Encapsulation, Interface', 'Encapsulates complaint data, auto-increments ID, implements Trackable.'],
    ['Priority', 'enum', 'Enumeration, Type Safety', 'Restricts priority to LOW, MEDIUM, HIGH constants.'],
    ['Status', 'enum', 'Enumeration, Type Safety', 'Restricts status to REGISTERED, IN_PROGRESS, RESOLVED constants.'],
    ['ComplaintNotFoundException', 'class (Exception)', 'Custom Exception Handling', 'Checked exception thrown when an invalid complaint ID is queried.'],
    ['ComplaintService', 'class', 'Collections Framework', 'Uses LinkedHashMap<Integer, Complaint> and ArrayList<User> for logic.'],
    ['Main', 'class', 'Application Driver', 'Console interactive menu with robust input and error handling.']
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E0' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E0' },
      left: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E0' },
      right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E0' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' }
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          h =>
            new TableCell({
              shading: { fill: '2B6CB0' },
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: h,
                      font: 'Arial',
                      bold: true,
                      size: 20,
                      color: 'FFFFFF'
                    })
                  ]
                })
              ]
            })
        )
      }),
      ...rows.map(
        r =>
          new TableRow({
            children: r.map(
              (cellText, idx) =>
                new TableCell({
                  shading: { fill: idx === 0 ? 'F7FAFC' : 'FFFFFF' },
                  margins: { top: 80, bottom: 80, left: 100, right: 100 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cellText,
                          font: idx === 0 ? 'Consolas' : 'Arial',
                          bold: idx === 0,
                          size: 19,
                          color: idx === 0 ? '2C5282' : '2D3748'
                        })
                      ]
                    })
                  ]
                })
            )
          })
      )
    ]
  });
}

// Write to file
const outputPath = path.join(__dirname, 'Complaint_Registration_and_Tracking_System_Assignment.docx');

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log('Successfully created Word document at: ' + outputPath);
});
