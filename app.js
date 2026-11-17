/**
 * ComplaintHub - Client-side Application Engine with SQLite Database Support
 * Implements:
 * 1. Java OOP State & Logic (User, Customer, Admin, Complaint, ComplaintService)
 * 2. SQLite Database REST API Integration with offline fallback
 * 3. Role-based Authentication (Customer / Admin)
 * 4. Dedicated "New Complaint Register" modal and instant ticket generation
 * 5. Interactive Java Terminal Simulator & 13-Screen Replay
 * 6. Java OOP Educational Explorer & UML Diagram Visualizer
 * 7. Java & SQL Source Code Browser
 */

// ==========================================
// 1. DATA MODELS & INITIAL SEED
// ==========================================

const INITIAL_USERS = [
  { name: 'admin', password: 'admin123', role: 'ADMIN' },
  { name: 'dinesh', password: 'dinesh123', role: 'CUSTOMER' },
  { name: 'ram', password: 'ram123', role: 'CUSTOMER' },
  { name: 'sita', password: 'sita123', role: 'CUSTOMER' },
  { name: 'priya', password: 'priya123', role: 'CUSTOMER' },
  { name: 'raj', password: 'raj123', role: 'CUSTOMER' }
];

const INITIAL_COMPLAINTS = [
  {
    id: 1001,
    customerName: 'dinesh',
    category: 'Service',
    description: 'Internet connection is down since two days',
    priority: 'HIGH',
    dateFiled: '2026-11-09',
    status: 'IN_PROGRESS',
    remarks: 'Technician assigned'
  },
  {
    id: 1002,
    customerName: 'ram',
    category: 'Billing',
    description: 'Charged twice for monthly bill',
    priority: 'MEDIUM',
    dateFiled: '2026-11-09',
    status: 'RESOLVED',
    remarks: 'Refund processed'
  },
  {
    id: 1003,
    customerName: 'sita',
    category: 'Product',
    description: 'Received a damaged product',
    priority: 'LOW',
    dateFiled: '2026-11-09',
    status: 'IN_PROGRESS',
    remarks: 'Replacement being arranged'
  },
  {
    id: 1004,
    customerName: 'priya',
    category: 'Service',
    description: 'Mobile network signal is very weak',
    priority: 'MEDIUM',
    dateFiled: '2026-11-09',
    status: 'REGISTERED',
    remarks: 'Awaiting review'
  },
  {
    id: 1005,
    customerName: 'raj',
    category: 'Other',
    description: 'Unable to update address in profile',
    priority: 'LOW',
    dateFiled: '2026-11-09',
    status: 'REGISTERED',
    remarks: 'Awaiting review'
  }
];

class StateManager {
  constructor() {
    this.useApi = window.location.protocol.startsWith('http');
    this.users = JSON.parse(localStorage.getItem('complaint_users')) || [...INITIAL_USERS];
    this.complaints = JSON.parse(localStorage.getItem('complaint_data')) || [...INITIAL_COMPLAINTS];
    this.counter = this.complaints.reduce((max, c) => Math.max(max, c.id), 1000);
    this.currentUser = JSON.parse(localStorage.getItem('complaint_current_user')) || this.users[1]; // dinesh
    this.selectedPriority = 'MEDIUM';
    this.modalSelectedPriority = 'MEDIUM';
    this.dbStatus = { connected: false, engine: 'Local Fallback' };
  }

  async checkDbStatus() {
    if (!this.useApi) return;
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        this.dbStatus = await res.json();
        const indicator = document.getElementById('db-status-text');
        if (indicator) {
          indicator.textContent = `SQLite: Connected (${this.dbStatus.complaintRecords} records)`;
        }
      }
    } catch (e) {
      console.log('Running in local state mode:', e.message);
    }
  }

  async refreshData() {
    if (this.useApi) {
      try {
        const res = await fetch('/api/complaints');
        if (res.ok) {
          this.complaints = await res.json();
          this.saveLocal();
        }
      } catch (e) {
        // Fall back to memory/local
      }
    }
  }

  saveLocal() {
    localStorage.setItem('complaint_users', JSON.stringify(this.users));
    localStorage.setItem('complaint_data', JSON.stringify(this.complaints));
    localStorage.setItem('complaint_current_user', JSON.stringify(this.currentUser));
  }

  async resetToDefault() {
    if (this.useApi) {
      try {
        await fetch('/api/reset', { method: 'POST' });
        await this.refreshData();
      } catch (e) {}
    }
    this.users = [...INITIAL_USERS];
    this.complaints = [...INITIAL_COMPLAINTS];
    this.counter = 1005;
    this.currentUser = this.users[1];
    this.saveLocal();
  }

  async registerUser(name, password) {
    if (this.useApi) {
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
      } catch (err) {
        if (!err.message.includes('fetch')) throw err;
      }
    }
    if (this.users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      throw new Error(`User "${name}" already exists.`);
    }
    const user = { name, password, role: 'CUSTOMER' };
    this.users.push(user);
    this.saveLocal();
    return user;
  }

  async login(name, password) {
    if (this.useApi) {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, password })
        });
        if (res.ok) {
          const user = await res.json();
          this.currentUser = user;
          this.saveLocal();
          return user;
        }
      } catch (e) {}
    }
    const user = this.users.find(
      u => u.name.toLowerCase() === name.toLowerCase() && u.password === password
    );
    if (!user) return null;
    this.currentUser = user;
    this.saveLocal();
    return user;
  }

  logout() {
    this.currentUser = null;
    this.saveLocal();
  }

  async fileComplaint(customerName, category, description, priority) {
    if (this.useApi) {
      try {
        const res = await fetch('/api/complaints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerName, category, description, priority })
        });
        if (res.ok) {
          const created = await res.json();
          this.complaints.unshift(created);
          this.saveLocal();
          await this.checkDbStatus();
          return created;
        }
      } catch (e) {
        console.warn('API filing failed, saving locally:', e);
      }
    }

    this.counter++;
    const complaint = {
      id: this.counter,
      customerName,
      category,
      description,
      priority: priority.toUpperCase(),
      dateFiled: new Date().toISOString().split('T')[0],
      status: 'REGISTERED',
      remarks: 'Awaiting review'
    };
    this.complaints.unshift(complaint);
    this.saveLocal();
    return complaint;
  }

  findComplaintById(id) {
    const complaint = this.complaints.find(c => c.id === parseInt(id));
    if (!complaint) {
      throw new Error(`No complaint found with ID: ${id}`);
    }
    return complaint;
  }

  async updateComplaint(id, status, remarks) {
    if (this.useApi) {
      try {
        const res = await fetch(`/api/complaints/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, remarks })
        });
        if (res.ok) {
          const updated = await res.json();
          const idx = this.complaints.findIndex(c => c.id === parseInt(id));
          if (idx !== -1) this.complaints[idx] = updated;
          this.saveLocal();
          return updated;
        }
      } catch (e) {}
    }

    const complaint = this.findComplaintById(id);
    complaint.status = status;
    if (remarks !== undefined && remarks.trim() !== '') {
      complaint.remarks = remarks.trim();
    }
    this.saveLocal();
    return complaint;
  }

  getComplaintsByCustomer(name) {
    return this.complaints.filter(
      c => c.customerName.toLowerCase() === name.toLowerCase()
    );
  }

  getAllComplaints() {
    return this.complaints;
  }

  getCounts() {
    return {
      total: this.complaints.length,
      registered: this.complaints.filter(c => c.status === 'REGISTERED').length,
      inProgress: this.complaints.filter(c => c.status === 'IN_PROGRESS').length,
      resolved: this.complaints.filter(c => c.status === 'RESOLVED').length
    };
  }
}

const state = new StateManager();

// ==========================================
// 2. JAVA & SQL SOURCE CODE REPOSITORY
// ==========================================

const JAVA_SOURCES = {
  'Priority.java': {
    type: 'enum',
    desc: 'Enumeration representing complaint urgency levels: LOW, MEDIUM, HIGH.',
    code: `public enum Priority {
    LOW, MEDIUM, HIGH
}`
  },
  'Status.java': {
    type: 'enum',
    desc: 'Enumeration representing complaint lifecycle states: REGISTERED, IN_PROGRESS, RESOLVED.',
    code: `public enum Status {
    REGISTERED, IN_PROGRESS, RESOLVED
}`
  },
  'ComplaintNotFoundException.java': {
    type: 'exception',
    desc: 'Custom checked exception thrown when an invalid complaint ID is searched or updated.',
    code: `public class ComplaintNotFoundException extends Exception {
    public ComplaintNotFoundException(int id) {
        super("No complaint found with ID: " + id);
    }
}`
  },
  'Trackable.java': {
    type: 'interface',
    desc: 'Interface defining contract for entities with dynamic status tracking.',
    code: `public interface Trackable {
    void updateStatus(Status newStatus);
    Status getStatus();
}`
  },
  'Complaint.java': {
    type: 'class',
    desc: 'Encapsulated entity modeling complaint attributes, implementing Trackable.',
    code: `import java.time.LocalDate;

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
}`
  },
  'User.java': {
    type: 'abstract class',
    desc: 'Abstract base class encapsulating common credentials and enforcing getRole() contract.',
    code: `public abstract class User {
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
}`
  },
  'Customer.java': {
    type: 'class',
    desc: 'Inherits User; specifies the role "CUSTOMER".',
    code: `public class Customer extends User {
    public Customer(String name, String password) {
        super(name, password);
    }

    @Override
    public String getRole() {
        return "CUSTOMER";
    }
}`
  },
  'Admin.java': {
    type: 'class',
    desc: 'Inherits User; specifies the role "ADMIN".',
    code: `public class Admin extends User {
    public Admin(String name, String password) {
        super(name, password);
    }

    @Override
    public String getRole() {
        return "ADMIN";
    }
}`
  },
  'ComplaintService.java': {
    type: 'class',
    desc: 'Business logic layer utilizing LinkedHashMap and ArrayList collections.',
    code: `import java.util.ArrayList;
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
}`
  },
  'Main.java': {
    type: 'class',
    desc: 'Console CLI entry point with role-based menus and exception handling.',
    code: `import java.util.List;
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
}`
  },
  'schema.sql': {
    type: 'SQL Database',
    desc: 'SQLite Database Schema definition for users and complaints tables.',
    code: `-- SQLite Database Schema: complaints.db
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('CUSTOMER', 'ADMIN'))
);

CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
    date_filed TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('REGISTERED', 'IN_PROGRESS', 'RESOLVED')) DEFAULT 'REGISTERED',
    remarks TEXT DEFAULT 'Awaiting review'
);`
  }
};

// ==========================================
// 3. 13 TERMINAL SCREENS REPLAY FROM PDF
// ==========================================
const PDF_SCREENS = [
  {
    title: 'Screen 1 of 13: Customer Registrations',
    desc: 'Registering four initial customers: dinesh, ram, sita, and priya.',
    lines: [
      { text: '===== COMPLAINT REGISTRATION AND TRACKING SYSTEM =====', type: 'highlight' },
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 1', type: 'prompt' },
      { text: 'Enter name: dinesh\nEnter password: dinesh123', type: 'input' },
      { text: 'Registration successful. Please login.', type: 'success' },
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 1', type: 'prompt' },
      { text: 'Enter name: ram\nEnter password: ram123', type: 'input' },
      { text: 'Registration successful. Please login.', type: 'success' },
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 1', type: 'prompt' },
      { text: 'Enter name: sita\nEnter password: sita123', type: 'input' },
      { text: 'Registration successful. Please login.', type: 'success' },
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 1', type: 'prompt' },
      { text: 'Enter name: priya\nEnter password: priya123', type: 'input' },
      { text: 'Registration successful. Please login.', type: 'success' }
    ]
  },
  {
    title: 'Screen 2 of 13: Invalid Choice & Filing Complaint 1001',
    desc: 'Registering raj, invalid input (9), login as dinesh, and filing complaint 1001.',
    lines: [
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 1', type: 'prompt' },
      { text: 'Enter name: raj\nEnter password: raj123', type: 'input' },
      { text: 'Registration successful. Please login.', type: 'success' },
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 9', type: 'prompt' },
      { text: 'Invalid choice.', type: 'danger' },
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 2', type: 'prompt' },
      { text: 'Username: dinesh\nPassword: dinesh123', type: 'input' },
      { text: '\nWelcome, dinesh [CUSTOMER]', type: 'highlight' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 1', type: 'prompt' },
      { text: 'Category (Billing/Service/Product/Other): Service', type: 'input' },
      { text: 'Description: Internet connection is down since two days', type: 'input' },
      { text: 'Priority (LOW/MEDIUM/HIGH): HIGH', type: 'input' },
      { text: 'Complaint registered successfully! Your Complaint ID is 1001', type: 'success' }
    ]
  },
  {
    title: 'Screen 3 of 13: Dinesh Views Complaints & Ram Logs In',
    desc: 'Dinesh views complaint 1001, logs out, and Ram logs in.',
    lines: [
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 3', type: 'prompt' },
      { text: '----------------------------------------\nComplaint ID : 1001\nCustomer     : dinesh\nCategory     : Service\nDescription  : Internet connection is down since two days\nPriority     : HIGH\nDate Filed   : 2026-11-09\nStatus       : REGISTERED\nRemarks      : Awaiting review\n----------------------------------------', type: 'normal' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 4', type: 'prompt' },
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 2', type: 'prompt' },
      { text: 'Username: ram\nPassword: ram123', type: 'input' },
      { text: '\nWelcome, ram [CUSTOMER]', type: 'highlight' }
    ]
  },
  {
    title: 'Screen 4 of 13: Ram Files Complaint 1002 & Tracks It',
    desc: 'Ram files Billing complaint 1002 (MEDIUM), tracks it, and logs out.',
    lines: [
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 1', type: 'prompt' },
      { text: 'Category (Billing/Service/Product/Other): Billing\nDescription: Charged twice for monthly bill\nPriority (LOW/MEDIUM/HIGH): medium', type: 'input' },
      { text: 'Complaint registered successfully! Your Complaint ID is 1002', type: 'success' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 2', type: 'prompt' },
      { text: 'Enter Complaint ID: 1002', type: 'input' },
      { text: '----------------------------------------\nComplaint ID : 1002\nCustomer     : ram\nCategory     : Billing\nDescription  : Charged twice for monthly bill\nPriority     : MEDIUM\nDate Filed   : 2026-11-09\nStatus       : REGISTERED\nRemarks      : Awaiting review\n----------------------------------------', type: 'normal' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 4', type: 'prompt' }
    ]
  },
  {
    title: 'Screen 5 of 13: Sita Files 1003 & Tests Custom Exception',
    desc: 'Sita files complaint 1003 and tests tracking invalid ID 9999.',
    lines: [
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 2', type: 'prompt' },
      { text: 'Username: sita\nPassword: sita123', type: 'input' },
      { text: '\nWelcome, sita [CUSTOMER]', type: 'highlight' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 1', type: 'prompt' },
      { text: 'Category (Billing/Service/Product/Other): Product\nDescription: Received a damaged product\nPriority (LOW/MEDIUM/HIGH): LOW', type: 'input' },
      { text: 'Complaint registered successfully! Your Complaint ID is 1003', type: 'success' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 2', type: 'prompt' },
      { text: 'Enter Complaint ID: 9999', type: 'input' },
      { text: 'No complaint found with ID: 9999', type: 'danger' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 4', type: 'prompt' }
    ]
  },
  {
    title: 'Screen 6 of 13: Priority Fallback & Authentication Error',
    desc: 'Priya inputs invalid priority "urgent" (defaults to MEDIUM). Raj tests wrong password raj999.',
    lines: [
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 2', type: 'prompt' },
      { text: 'Username: priya\nPassword: priya123', type: 'input' },
      { text: '\nWelcome, priya [CUSTOMER]', type: 'highlight' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 1', type: 'prompt' },
      { text: 'Category (Billing/Service/Product/Other): Service\nDescription: Mobile network signal is very weak\nPriority (LOW/MEDIUM/HIGH): urgent', type: 'input' },
      { text: 'Invalid priority. Defaulting to MEDIUM.', type: 'warning' },
      { text: 'Complaint registered successfully! Your Complaint ID is 1004', type: 'success' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 4', type: 'prompt' },
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 2', type: 'prompt' },
      { text: 'Username: raj\nPassword: raj999', type: 'input' },
      { text: 'Invalid credentials.', type: 'danger' }
    ]
  },
  {
    title: 'Screen 7 of 13: Raj Files 1005 & Admin Session',
    desc: 'Raj logs in, files complaint 1005, logs out, and Admin logs in.',
    lines: [
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 2', type: 'prompt' },
      { text: 'Username: raj\nPassword: raj123', type: 'input' },
      { text: '\nWelcome, raj [CUSTOMER]', type: 'highlight' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 1', type: 'prompt' },
      { text: 'Category (Billing/Service/Product/Other): Other\nDescription: Unable to update address in profile\nPriority (LOW/MEDIUM/HIGH): low', type: 'input' },
      { text: 'Complaint registered successfully! Your Complaint ID is 1005', type: 'success' },
      { text: '\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout\nEnter choice: 4', type: 'prompt' },
      { text: '\n1. Register as Customer\n2. Login\n3. Exit\nEnter choice: 2', type: 'prompt' },
      { text: 'Username: admin\nPassword: admin123', type: 'input' },
      { text: '\nWelcome, admin [ADMIN]', type: 'highlight' }
    ]
  },
  {
    title: 'Screen 8 to 11: Admin Management & Summary Report',
    desc: 'Admin views all complaints, updates status, handles errors, and prints summary.',
    lines: [
      { text: 'Admin updates 1001 to IN_PROGRESS, 1002 to RESOLVED, 1003 to IN_PROGRESS', type: 'highlight' },
      { text: '\n--- Summary Report ---\nTotal       : 5\nREGISTERED  : 2\nIN_PROGRESS : 2\nRESOLVED    : 1', type: 'success' }
    ]
  },
  {
    title: 'Screen 12 & 13: Customer Verification & Exit',
    desc: 'Dinesh tracks 1001, verifies updated status is IN_PROGRESS, logs out, and exits.',
    lines: [
      { text: 'Complaint ID: 1001 -> Status: IN_PROGRESS (Remarks: Technician assigned)', type: 'success' },
      { text: 'Thank you. Goodbye!', type: 'highlight' }
    ]
  }
];

// ==========================================
// 4. OOP CONCEPTS DEFINITIONS
// ==========================================
const OOP_CONCEPTS = [
  {
    id: 'class-object',
    title: '1. Class & Object',
    tag: 'Foundation',
    badgeColor: '#4f46e5',
    desc: 'A class is a blueprint from which objects are created. An object encapsulates state (fields) and behavior (methods).',
    projectUse: 'Complaint models complaint state, while ComplaintService acts as the service controller managing operations.',
    codeSnippet: `// Blueprint class
public class Complaint implements Trackable {
    private final int id;
    private final String customerName;
}

// Instance creation
Complaint c = new Complaint(customer, category, description, priority);`
  },
  {
    id: 'encapsulation',
    title: '2. Encapsulation',
    tag: 'Data Hiding',
    badgeColor: '#10b981',
    desc: 'Restricts direct access to fields to protect internal invariants, exposing data only via getters and setters.',
    projectUse: 'Complaint keeps id, customerName, priority private. Status is mutated only via updateStatus(), and remarks via setRemarks().',
    codeSnippet: `public class Complaint {
    private final int id;
    private Status status;
    public int getId() { return id; }
    public Status getStatus() { return status; }
}`
  },
  {
    id: 'inheritance',
    title: '3. Inheritance',
    tag: 'Code Reuse',
    badgeColor: '#f59e0b',
    desc: 'Allows a child class to inherit fields and methods from a parent class using extends, eliminating duplication.',
    projectUse: 'Both Customer and Admin extend User, sharing credentials and authentication logic.',
    codeSnippet: `public abstract class User {
    protected String name;
    protected String password;
}

public class Customer extends User { ... }
public class Admin extends User { ... }`
  },
  {
    id: 'abstraction',
    title: '4. Abstraction',
    tag: 'Contract',
    badgeColor: '#06b6d4',
    desc: 'Hides internal complexities and exposes only essential specifications via abstract classes and interfaces.',
    projectUse: 'User is an abstract class with getRole(). Trackable is an interface that specifies updateStatus() and getStatus().',
    codeSnippet: `public interface Trackable {
    void updateStatus(Status newStatus);
    Status getStatus();
}`
  },
  {
    id: 'polymorphism',
    title: '5. Polymorphism',
    tag: 'Dynamic Dispatch',
    badgeColor: '#8b5cf6',
    desc: 'Allows objects of different subclasses to be treated uniformly via a common supertype interface.',
    projectUse: 'user.getRole() returns "CUSTOMER" or "ADMIN" dynamically at runtime without conditional branching.',
    codeSnippet: `User user = service.login(name, pass);
System.out.println("Role: " + user.getRole());`
  },
  {
    id: 'enumeration',
    title: '6. Enumerations (Enum)',
    tag: 'Type Safety',
    badgeColor: '#ec4899',
    desc: 'Enums define a fixed set of named constants, providing compile-time type safety over arbitrary strings.',
    projectUse: 'Priority (LOW, MEDIUM, HIGH) and Status (REGISTERED, IN_PROGRESS, RESOLVED) prevent invalid entries.',
    codeSnippet: `public enum Priority { LOW, MEDIUM, HIGH }
public enum Status { REGISTERED, IN_PROGRESS, RESOLVED }`
  },
  {
    id: 'exception-handling',
    title: '7. Exception Handling',
    tag: 'Robustness',
    badgeColor: '#ef4444',
    desc: 'Structured exception handling prevents system crashes by catching errors at runtime with recovery logic.',
    projectUse: 'ComplaintNotFoundException is a custom checked exception thrown when a non-existent complaint ID is accessed.',
    codeSnippet: `public class ComplaintNotFoundException extends Exception {
    public ComplaintNotFoundException(int id) {
        super("No complaint found with ID: " + id);
    }
}`
  },
  {
    id: 'collections',
    title: '8. Collections & Database',
    tag: 'Persistence',
    badgeColor: '#14b8a6',
    desc: 'High-performance in-memory data structures (LinkedHashMap, ArrayList) paired with an embedded SQLite database.',
    projectUse: 'LinkedHashMap<Integer, Complaint> provides O(1) lookups in Java, mirrored in SQLite database table `complaints`.',
    codeSnippet: `private final Map<Integer, Complaint> complaints = new LinkedHashMap<>();
private final List<User> users = new ArrayList<>();`
  }
];

// ==========================================
// 5. APPLICATION INITIALIZATION & UI
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initTabs();
  await state.checkDbStatus();
  await state.refreshData();

  renderUserBadge();
  renderStats();
  renderComplaintTable();
  renderMyComplaints();
  initPriorityButtons();
  initFilingForm();
  initModalFilingForm();
  initTrackingSearch();
  initOopCards();
  initCodeViewer();
  initTerminal();
  initReplayMode();
  initAdminModal();
});

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Theme Switcher
function initTheme() {
  const btn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('complaint_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('complaint_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  btn.innerHTML = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
}

// Navigation Tabs
function initTabs() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

function switchTab(tabId) {
  const btn = document.querySelector(`.nav-tab-btn[data-tab="${tabId}"]`);
  if (btn) btn.click();
}

// User Badge & Role View
function renderUserBadge() {
  const container = document.getElementById('user-pill-container');
  const customerView = document.getElementById('customer-view');
  const adminView = document.getElementById('admin-view');
  const welcomeText = document.getElementById('customer-welcome-text');

  if (!container) return;

  if (state.currentUser) {
    container.innerHTML = `
      <div class="user-pill">
        <span>👤 ${state.currentUser.name}</span>
        <span class="role-badge">${state.currentUser.role}</span>
        <button id="logout-btn" style="background:transparent; border:none; cursor:pointer; color:inherit; font-size:0.8rem; margin-left:4px;" title="Logout">✖</button>
      </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
      state.logout();
      renderUserBadge();
      showToast('Logged out successfully.', 'info');
    });

    if (state.currentUser.role === 'ADMIN') {
      if (adminView) adminView.style.display = 'block';
      if (customerView) customerView.style.display = 'none';
    } else {
      if (adminView) adminView.style.display = 'none';
      if (customerView) customerView.style.display = 'block';
      if (welcomeText) welcomeText.textContent = `Welcome, ${state.currentUser.name}! File or track your grievances below.`;
      
      const compCustNameInput = document.getElementById('comp-customer-name');
      if (compCustNameInput) compCustNameInput.value = state.currentUser.name;

      renderMyComplaints();
    }
  } else {
    container.innerHTML = `
      <button class="action-btn" onclick="openLoginModal()">🔑 Login / Register</button>
    `;
    if (adminView) adminView.style.display = 'none';
    if (customerView) customerView.style.display = 'block';
    if (welcomeText) welcomeText.textContent = `Please login or register a complaint.`;
  }
}

// Quick Logins
window.quickLogin = async function(username) {
  const user = state.users.find(u => u.name.toLowerCase() === username.toLowerCase());
  if (user) {
    state.currentUser = user;
    state.saveLocal();
    renderUserBadge();
    renderStats();
    renderComplaintTable();
    showToast(`Logged in as ${user.name} [${user.role}]`, 'success');
  }
};

window.resetData = async function() {
  if (confirm('Reset SQLite database and system data to initial PDF demo state?')) {
    await state.resetToDefault();
    await state.checkDbStatus();
    renderUserBadge();
    renderStats();
    renderComplaintTable();
    renderMyComplaints();
    showToast('Database reset to PDF initial demo state!', 'success');
  }
};

// Priority Selector in Filing Form
function initPriorityButtons() {
  // Page inline form buttons
  const buttons = document.querySelectorAll('#file-complaint-form .priority-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedPriority = btn.getAttribute('data-val');
    });
  });

  // Modal form buttons
  const modalButtons = document.querySelectorAll('#modal-priority-selector .priority-btn');
  modalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modalButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.modalSelectedPriority = btn.getAttribute('data-val');
    });
  });
}

// Inline File Complaint Form
function initFilingForm() {
  const form = document.getElementById('file-complaint-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const customerName = document.getElementById('comp-customer-name').value.trim() || (state.currentUser ? state.currentUser.name : 'Guest');
    const category = document.getElementById('comp-category').value;
    const desc = document.getElementById('comp-desc').value.trim();
    const priority = state.selectedPriority || 'MEDIUM';

    if (!desc) {
      showToast('Please provide a complaint description.', 'warning');
      return;
    }

    try {
      const comp = await state.fileComplaint(customerName, category, desc, priority);
      showToast(`Complaint registered in Database! ID: #${comp.id}`, 'success');
      form.reset();
      document.querySelector('#file-complaint-form .priority-btn[data-val="MEDIUM"]')?.click();
      if (state.currentUser) {
        document.getElementById('comp-customer-name').value = state.currentUser.name;
      }

      renderStats();
      renderComplaintTable();
      renderMyComplaints();
      trackComplaintDirectly(comp.id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// Dedicated Modal "Register New Complaint"
window.openNewComplaintModal = function() {
  const modal = document.getElementById('new-complaint-modal');
  if (!modal) return;

  const nameInput = document.getElementById('modal-comp-name');
  if (nameInput) {
    nameInput.value = state.currentUser ? state.currentUser.name : '';
  }
  modal.classList.add('active');
};

function initModalFilingForm() {
  const form = document.getElementById('modal-complaint-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const customerName = document.getElementById('modal-comp-name').value.trim();
    const category = document.getElementById('modal-comp-category').value;
    const desc = document.getElementById('modal-comp-desc').value.trim();
    const priority = state.modalSelectedPriority || 'MEDIUM';

    if (!customerName || !desc) {
      showToast('Please fill in both customer name and description.', 'warning');
      return;
    }

    try {
      const comp = await state.fileComplaint(customerName, category, desc, priority);
      closeModal('new-complaint-modal');
      form.reset();
      showToast(`Complaint #${comp.id} registered in SQLite successfully!`, 'success');

      renderStats();
      renderComplaintTable();
      renderMyComplaints();
      switchTab('live-tab');
      trackComplaintDirectly(comp.id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// Track Complaint Search
function initTrackingSearch() {
  const trackForm = document.getElementById('track-form');
  if (!trackForm) return;

  trackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('track-id-input').value.trim();
    const id = parseInt(input);

    if (isNaN(id)) {
      showToast('Please enter a valid numeric complaint ID.', 'warning');
      return;
    }

    trackComplaintDirectly(id);
  });
}

function trackComplaintDirectly(id) {
  const resultCard = document.getElementById('tracking-result');
  if (!resultCard) return;

  try {
    const comp = state.findComplaintById(id);
    resultCard.style.display = 'block';

    const step1 = document.getElementById('step-registered');
    const step2 = document.getElementById('step-progress');
    const step3 = document.getElementById('step-resolved');
    const stepperBar = document.getElementById('stepper-progress-bar');

    [step1, step2, step3].forEach(s => s.classList.remove('active', 'completed'));

    if (comp.status === 'REGISTERED') {
      step1.classList.add('active');
      stepperBar.style.width = '0%';
    } else if (comp.status === 'IN_PROGRESS') {
      step1.classList.add('completed');
      step2.classList.add('active');
      stepperBar.style.width = '50%';
    } else if (comp.status === 'RESOLVED') {
      step1.classList.add('completed');
      step2.classList.add('completed');
      step3.classList.add('active');
      stepperBar.style.width = '100%';
    }

    document.getElementById('track-display-id').textContent = `#${comp.id}`;
    document.getElementById('track-display-customer').textContent = comp.customerName;
    document.getElementById('track-display-category').textContent = comp.category;
    document.getElementById('track-display-date').textContent = comp.dateFiled;
    document.getElementById('track-display-desc').textContent = comp.description;
    document.getElementById('track-display-remarks').textContent = comp.remarks || 'Awaiting review';

    const badgeElem = document.getElementById('track-display-status');
    badgeElem.className = `badge badge-${comp.status.toLowerCase()}`;
    badgeElem.textContent = comp.status;

    const prioElem = document.getElementById('track-display-priority');
    prioElem.className = `badge badge-${comp.priority.toLowerCase()}`;
    prioElem.textContent = comp.priority;

    showToast(`Found Complaint #${comp.id}`, 'info');
  } catch (err) {
    resultCard.style.display = 'none';
    showToast(err.message, 'error');
  }
}

// Render Stats
function renderStats() {
  const counts = state.getCounts();
  const elTotal = document.getElementById('stat-total');
  const elReg = document.getElementById('stat-registered');
  const elProg = document.getElementById('stat-progress');
  const elRes = document.getElementById('stat-resolved');

  if (elTotal) elTotal.textContent = counts.total;
  if (elReg) elReg.textContent = counts.registered;
  if (elProg) elProg.textContent = counts.inProgress;
  if (elRes) elRes.textContent = counts.resolved;
}

// Master Admin Complaint Table
function renderComplaintTable() {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  const search = (document.getElementById('admin-search-input')?.value || '').toLowerCase();
  const filterStatus = document.getElementById('admin-filter-status')?.value || 'ALL';
  const filterPriority = document.getElementById('admin-filter-priority')?.value || 'ALL';

  let list = state.getAllComplaints();

  if (filterStatus !== 'ALL') {
    list = list.filter(c => c.status === filterStatus);
  }
  if (filterPriority !== 'ALL') {
    list = list.filter(c => c.priority === filterPriority);
  }
  if (search) {
    list = list.filter(c => 
      c.id.toString().includes(search) ||
      c.customerName.toLowerCase().includes(search) ||
      c.category.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search)
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No complaints match the criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => `
    <tr>
      <td><strong>#${c.id}</strong></td>
      <td>${c.customerName}</td>
      <td>${c.category}</td>
      <td><span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span></td>
      <td><span class="badge badge-${c.status.toLowerCase()}">${c.status}</span></td>
      <td style="max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${c.remarks || ''}">
        ${c.remarks || 'Awaiting review'}
      </td>
      <td>
        <button class="action-btn" onclick="openUpdateModal(${c.id})" style="padding:0.3rem 0.6rem; font-size:0.75rem;">
          ✏️ Update
        </button>
      </td>
    </tr>
  `).join('');
}

// Customer "My Complaints"
function renderMyComplaints() {
  const listContainer = document.getElementById('my-complaints-list');
  if (!listContainer) return;

  if (!state.currentUser) {
    listContainer.innerHTML = `<p style="color:var(--text-muted); padding:1rem; text-align:center;">Please log in to view your complaints.</p>`;
    return;
  }

  const list = state.getComplaintsByCustomer(state.currentUser.name);
  if (list.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align:center; padding:2rem; color:var(--text-muted);">
        <p>No complaints registered yet for ${state.currentUser.name}.</p>
        <button class="btn-primary" onclick="openNewComplaintModal()" style="margin:0.75rem auto 0; width:auto; font-size:0.85rem; padding:0.4rem 0.8rem;">
          ➕ Register New Complaint
        </button>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = list.map(c => `
    <div style="background:var(--bg); border:1px solid var(--card-border); border-radius:var(--radius-md); padding:1rem; margin-bottom:0.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <div>
          <span style="font-weight:700; color:var(--primary); margin-right:0.5rem;">#${c.id}</span>
          <span style="font-size:0.85rem; font-weight:600;">${c.category}</span>
        </div>
        <div>
          <span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span>
          <span class="badge badge-${c.status.toLowerCase()}">${c.status}</span>
        </div>
      </div>
      <p style="font-size:0.85rem; margin-bottom:0.5rem; color:var(--text-main);">${c.description}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted); border-top:1px dashed var(--card-border); padding-top:0.5rem;">
        <span>📅 ${c.dateFiled}</span>
        <span>💬 <em>${c.remarks || 'Awaiting review'}</em></span>
      </div>
    </div>
  `).join('');
}

// Table Filters
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('admin-search-input')?.addEventListener('input', renderComplaintTable);
  document.getElementById('admin-filter-status')?.addEventListener('change', renderComplaintTable);
  document.getElementById('admin-filter-priority')?.addEventListener('change', renderComplaintTable);
});

// Admin Update Modal
function initAdminModal() {
  const form = document.getElementById('update-status-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('update-comp-id').value);
    const status = document.getElementById('update-comp-status').value;
    const remarks = document.getElementById('update-comp-remarks').value;

    try {
      await state.updateComplaint(id, status, remarks);
      showToast(`Complaint #${id} updated in Database!`, 'success');
      closeModal('update-modal');
      renderStats();
      renderComplaintTable();
      renderMyComplaints();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

window.openUpdateModal = function(id) {
  try {
    const comp = state.findComplaintById(id);
    document.getElementById('update-comp-id').value = comp.id;
    document.getElementById('update-display-id').textContent = `#${comp.id} (${comp.customerName} - ${comp.category})`;
    document.getElementById('update-comp-status').value = comp.status;
    document.getElementById('update-comp-remarks').value = comp.remarks || '';
    document.getElementById('update-modal').classList.add('active');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.openSummaryReport = function() {
  const counts = state.getCounts();
  const content = document.getElementById('summary-report-content');
  if (content) {
    content.innerHTML = `
      <div style="font-family:var(--font-mono); font-size:0.9rem; line-height:1.8; background:var(--terminal-bg); color:#38bdf8; padding:1.25rem; border-radius:var(--radius-md);">
        <div>========================================</div>
        <div style="font-weight:700; color:#f1f5f9; text-align:center;">--- Summary Report (SQLite) ---</div>
        <div>========================================</div>
        <div>Total Complaints : <strong>${counts.total}</strong></div>
        <div>REGISTERED       : <strong>${counts.registered}</strong></div>
        <div>IN_PROGRESS      : <strong>${counts.inProgress}</strong></div>
        <div>RESOLVED         : <strong>${counts.resolved}</strong></div>
        <div>========================================</div>
        <div style="color:#94a3b8; font-size:0.8rem; margin-top:0.5rem;">Report generated at: ${new Date().toLocaleString()}</div>
      </div>
    `;
  }
  document.getElementById('summary-modal').classList.add('active');
};

window.openLoginModal = function() {
  document.getElementById('login-modal').classList.add('active');
};

window.closeModal = function(modalId) {
  document.getElementById(modalId)?.classList.remove('active');
};

// Handle manual Login & Register
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('login-user').value.trim();
      const pass = document.getElementById('login-pass').value.trim();

      const user = await state.login(name, pass);
      if (user) {
        showToast(`Welcome back, ${user.name}!`, 'success');
        closeModal('login-modal');
        renderUserBadge();
        renderStats();
        renderComplaintTable();
        renderMyComplaints();
      } else {
        showToast('Invalid credentials.', 'error');
      }
    });
  }

  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-user').value.trim();
      const pass = document.getElementById('reg-pass').value.trim();

      if (!name || !pass) {
        showToast('Name and password cannot be empty.', 'warning');
        return;
      }

      try {
        await state.registerUser(name, pass);
        showToast(`Registration successful for ${name}. Please login.`, 'success');
        document.getElementById('login-user').value = name;
        document.getElementById('login-pass').value = pass;
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
});

// ==========================================
// 6. OOP CONCEPTS CARDS
// ==========================================

function initOopCards() {
  const grid = document.getElementById('oop-grid');
  if (!grid) return;

  grid.innerHTML = OOP_CONCEPTS.map(c => `
    <div class="oop-card">
      <span class="oop-badge" style="background:${c.badgeColor}15; color:${c.badgeColor}; border:1px solid ${c.badgeColor}40;">
        ${c.tag}
      </span>
      <h3 class="oop-title">${c.title}</h3>
      <p class="oop-desc">${c.desc}</p>
      <div class="oop-project-use">
        <strong>Application in System:</strong><br/>
        ${c.projectUse}
      </div>
      <pre class="oop-code-box"><code>${escapeHtml(c.codeSnippet)}</code></pre>
      <div class="oop-card-footer">
        <button class="action-btn" onclick="testOopLive('${c.id}')" style="font-size:0.75rem;">
          🔍 Inspect in Code
        </button>
      </div>
    </div>
  `).join('');
}

window.testOopLive = function(conceptId) {
  switchTab('code-tab');
  const fileMap = {
    'class-object': 'Complaint.java',
    'encapsulation': 'Complaint.java',
    'inheritance': 'Customer.java',
    'abstraction': 'Trackable.java',
    'polymorphism': 'ComplaintService.java',
    'enumeration': 'Priority.java',
    'exception-handling': 'ComplaintNotFoundException.java',
    'collections': 'schema.sql'
  };
  const targetFile = fileMap[conceptId] || 'Complaint.java';
  selectCodeFile(targetFile);
  showToast(`Inspecting ${targetFile} for concept implementation.`, 'info');
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==========================================
// 7. JAVA & SQL CODE VIEWER
// ==========================================

function initCodeViewer() {
  const listContainer = document.getElementById('code-files-list');
  if (!listContainer) return;

  const fileNames = Object.keys(JAVA_SOURCES);

  listContainer.innerHTML = fileNames.map((fn, idx) => `
    <button class="code-file-btn ${idx === 0 ? 'active' : ''}" onclick="selectCodeFile('${fn}')" id="code-btn-${fn.replace('.', '-')}">
      <span>${fn.endsWith('.sql') ? '🗄️' : '☕'} ${fn}</span>
      <span class="code-type-pill">${JAVA_SOURCES[fn].type}</span>
    </button>
  `).join('');

  selectCodeFile(fileNames[0]);
}

window.selectCodeFile = function(fileName) {
  const data = JAVA_SOURCES[fileName];
  if (!data) return;

  document.querySelectorAll('.code-file-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`code-btn-${fileName.replace('.', '-')}`)?.classList.add('active');

  document.getElementById('code-current-title').textContent = fileName;
  document.getElementById('code-current-desc').textContent = data.desc;
  document.getElementById('code-pre-element').textContent = data.code;
};

window.copyCurrentCode = function() {
  const code = document.getElementById('code-pre-element').textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast('Code copied to clipboard!', 'success');
  });
};

window.downloadJavaFiles = function() {
  let combined = `/* ================================================================\n * COMPLAINT REGISTRATION SYSTEM - JAVA OOP & SQL SOURCES\n * ================================================================ */\n\n`;
  for (const [filename, info] of Object.entries(JAVA_SOURCES)) {
    combined += `\n// ================= ${filename} =================\n`;
    combined += info.code + '\n\n';
  }
  const blob = new Blob([combined], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ComplaintSystem_Sources.txt';
  a.click();
  showToast('Sources downloaded successfully!', 'success');
};

// ==========================================
// 8. TERMINAL SIMULATOR
// ==========================================

let currentReplayIndex = 0;
let replayTimer = null;
let terminalSession = {
  stage: 'MAIN_MENU',
  user: null,
  tempCustomer: null,
  tempComplaint: {}
};

function initTerminal() {
  const termInput = document.getElementById('term-input');
  printTerminalBanner();

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = termInput.value.trim();
        termInput.value = '';
        handleTerminalInput(val);
      }
    });
  }
}

function printTerminalBanner() {
  appendTerminalLine('===== COMPLAINT REGISTRATION AND TRACKING SYSTEM =====', 'term-highlight');
  appendTerminalLine('\n1. Register as Customer');
  appendTerminalLine('2. Login');
  appendTerminalLine('3. Exit');
  setTerminalPrompt('Enter choice: ');
}

function appendTerminalLine(text, className = '') {
  const termBody = document.getElementById('terminal-body');
  if (!termBody) return;

  const div = document.createElement('div');
  div.className = `term-line ${className}`;
  div.textContent = text;
  termBody.appendChild(div);
  termBody.scrollTop = termBody.scrollHeight;
}

function setTerminalPrompt(promptText) {
  const pElem = document.getElementById('term-prompt-label');
  if (pElem) pElem.textContent = promptText;
}

function clearTerminal() {
  const termBody = document.getElementById('terminal-body');
  if (termBody) termBody.innerHTML = '';
  terminalSession = { stage: 'MAIN_MENU', user: null, tempCustomer: null, tempComplaint: {} };
  printTerminalBanner();
}

async function handleTerminalInput(input) {
  appendTerminalLine(`> ${input}`, 'term-prompt');

  switch (terminalSession.stage) {
    case 'MAIN_MENU':
      if (input === '1') {
        terminalSession.stage = 'REG_NAME';
        setTerminalPrompt('Enter name: ');
      } else if (input === '2') {
        terminalSession.stage = 'LOGIN_NAME';
        setTerminalPrompt('Username: ');
      } else if (input === '3') {
        appendTerminalLine('Thank you. Goodbye!', 'term-highlight');
        terminalSession.stage = 'EXITED';
        setTerminalPrompt('[Terminated] ');
      } else {
        appendTerminalLine('Invalid choice.', 'term-danger');
        printMainMenu();
      }
      break;

    case 'REG_NAME':
      terminalSession.tempCustomer = { name: input };
      terminalSession.stage = 'REG_PASS';
      setTerminalPrompt('Enter password: ');
      break;

    case 'REG_PASS':
      terminalSession.tempCustomer.pass = input;
      try {
        await state.registerUser(terminalSession.tempCustomer.name, terminalSession.tempCustomer.pass);
        appendTerminalLine('Registration successful. Please login.', 'term-success');
      } catch (err) {
        appendTerminalLine(`Registration error: ${err.message}`, 'term-danger');
      }
      terminalSession.stage = 'MAIN_MENU';
      printMainMenu();
      break;

    case 'LOGIN_NAME':
      terminalSession.tempLogin = { name: input };
      terminalSession.stage = 'LOGIN_PASS';
      setTerminalPrompt('Password: ');
      break;

    case 'LOGIN_PASS':
      terminalSession.tempLogin.pass = input;
      const user = await state.login(terminalSession.tempLogin.name, terminalSession.tempLogin.pass);
      if (!user) {
        appendTerminalLine('Invalid credentials.', 'term-danger');
        terminalSession.stage = 'MAIN_MENU';
        printMainMenu();
      } else {
        terminalSession.user = user;
        appendTerminalLine(`\nWelcome, ${user.name} [${user.role}]`, 'term-highlight');
        if (user.role === 'ADMIN') {
          terminalSession.stage = 'ADMIN_MENU';
          printAdminMenu();
        } else {
          terminalSession.stage = 'CUSTOMER_MENU';
          printCustomerMenu();
        }
      }
      break;

    case 'CUSTOMER_MENU':
      if (input === '1') {
        terminalSession.stage = 'FILE_CAT';
        setTerminalPrompt('Category (Billing/Service/Product/Other): ');
      } else if (input === '2') {
        terminalSession.stage = 'TRACK_ID';
        setTerminalPrompt('Enter Complaint ID: ');
      } else if (input === '3') {
        const list = state.getComplaintsByCustomer(terminalSession.user.name);
        if (list.length === 0) appendTerminalLine('No complaints found.');
        else list.forEach(c => printComplaintBox(c));
        printCustomerMenu();
      } else if (input === '4') {
        terminalSession.user = null;
        terminalSession.stage = 'MAIN_MENU';
        printMainMenu();
      } else {
        appendTerminalLine('Invalid choice.', 'term-danger');
        printCustomerMenu();
      }
      break;

    case 'FILE_CAT':
      terminalSession.tempComplaint.category = input;
      terminalSession.stage = 'FILE_DESC';
      setTerminalPrompt('Description: ');
      break;

    case 'FILE_DESC':
      terminalSession.tempComplaint.desc = input;
      terminalSession.stage = 'FILE_PRIORITY';
      setTerminalPrompt('Priority (LOW/MEDIUM/HIGH): ');
      break;

    case 'FILE_PRIORITY':
      let p = input.toUpperCase();
      if (!['LOW', 'MEDIUM', 'HIGH'].includes(p)) {
        appendTerminalLine('Invalid priority. Defaulting to MEDIUM.', 'term-warning');
        p = 'MEDIUM';
      }
      const c = await state.fileComplaint(terminalSession.user.name, terminalSession.tempComplaint.category, terminalSession.tempComplaint.desc, p);
      appendTerminalLine(`Complaint registered successfully! Your Complaint ID is ${c.id}`, 'term-success');
      terminalSession.stage = 'CUSTOMER_MENU';
      printCustomerMenu();
      break;

    case 'TRACK_ID':
      try {
        const comp = state.findComplaintById(input);
        printComplaintBox(comp);
      } catch (err) {
        appendTerminalLine(err.message, 'term-danger');
      }
      terminalSession.stage = 'CUSTOMER_MENU';
      printCustomerMenu();
      break;

    case 'ADMIN_MENU':
      if (input === '1') {
        const list = state.getAllComplaints();
        if (list.length === 0) appendTerminalLine('No complaints found.');
        else list.forEach(comp => printComplaintBox(comp));
        printAdminMenu();
      } else if (input === '2') {
        terminalSession.stage = 'ADMIN_UPDATE_ID';
        setTerminalPrompt('Enter Complaint ID: ');
      } else if (input === '3') {
        const counts = state.getCounts();
        appendTerminalLine('\n--- Summary Report ---', 'term-highlight');
        appendTerminalLine(`Total       : ${counts.total}`);
        appendTerminalLine(`REGISTERED  : ${counts.registered}`);
        appendTerminalLine(`IN_PROGRESS : ${counts.inProgress}`);
        appendTerminalLine(`RESOLVED    : ${counts.resolved}`);
        printAdminMenu();
      } else if (input === '4') {
        terminalSession.user = null;
        terminalSession.stage = 'MAIN_MENU';
        printMainMenu();
      } else {
        appendTerminalLine('Invalid choice.', 'term-danger');
        printAdminMenu();
      }
      break;

    case 'ADMIN_UPDATE_ID':
      terminalSession.tempUpdateId = input;
      terminalSession.stage = 'ADMIN_UPDATE_STATUS';
      setTerminalPrompt('New status (REGISTERED/IN_PROGRESS/RESOLVED): ');
      break;

    case 'ADMIN_UPDATE_STATUS':
      const s = input.toUpperCase();
      if (!['REGISTERED', 'IN_PROGRESS', 'RESOLVED'].includes(s)) {
        appendTerminalLine('Invalid status entered.', 'term-danger');
        terminalSession.stage = 'ADMIN_MENU';
        printAdminMenu();
      } else {
        terminalSession.tempUpdateStatus = s;
        terminalSession.stage = 'ADMIN_UPDATE_REMARKS';
        setTerminalPrompt('Remarks: ');
      }
      break;

    case 'ADMIN_UPDATE_REMARKS':
      try {
        await state.updateComplaint(terminalSession.tempUpdateId, terminalSession.tempUpdateStatus, input);
        appendTerminalLine('Complaint updated successfully in Database.', 'term-success');
      } catch (err) {
        appendTerminalLine(err.message, 'term-danger');
      }
      terminalSession.stage = 'ADMIN_MENU';
      printAdminMenu();
      break;

    case 'EXITED':
      appendTerminalLine('Session terminated. Click "Reset CLI" to start over.', 'term-warning');
      break;
  }
}

function printMainMenu() {
  appendTerminalLine('\n1. Register as Customer\n2. Login\n3. Exit');
  setTerminalPrompt('Enter choice: ');
}

function printCustomerMenu() {
  appendTerminalLine('\n1. File a Complaint\n2. Track Complaint by ID\n3. View My Complaints\n4. Logout');
  setTerminalPrompt('Enter choice: ');
}

function printAdminMenu() {
  appendTerminalLine('\n1. View All Complaints\n2. Update Complaint Status\n3. Summary Report\n4. Logout');
  setTerminalPrompt('Enter choice: ');
}

function printComplaintBox(c) {
  appendTerminalLine('----------------------------------------');
  appendTerminalLine(`Complaint ID : ${c.id}`);
  appendTerminalLine(`Customer     : ${c.customerName}`);
  appendTerminalLine(`Category     : ${c.category}`);
  appendTerminalLine(`Description  : ${c.description}`);
  appendTerminalLine(`Priority     : ${c.priority}`);
  appendTerminalLine(`Date Filed   : ${c.dateFiled}`);
  appendTerminalLine(`Status       : ${c.status}`);
  appendTerminalLine(`Remarks      : ${c.remarks || 'Awaiting review'}`);
  appendTerminalLine('----------------------------------------');
}

// 13-Screen Replay
function initReplayMode() {
  renderReplayScreen(0);
}

function renderReplayScreen(index) {
  currentReplayIndex = index;
  const screen = PDF_SCREENS[index];
  if (!screen) return;

  document.getElementById('replay-screen-badge').textContent = `Screen ${index + 1} of 13`;
  document.getElementById('replay-screen-title').textContent = screen.title;
  document.getElementById('replay-screen-desc').textContent = screen.desc;

  const termBody = document.getElementById('terminal-body');
  if (termBody) {
    termBody.innerHTML = '';
    screen.lines.forEach(line => {
      const cls = line.type === 'highlight' ? 'term-highlight' :
                  line.type === 'prompt' ? 'term-prompt' :
                  line.type === 'input' ? 'term-warning' :
                  line.type === 'success' ? 'term-success' :
                  line.type === 'danger' ? 'term-danger' :
                  line.type === 'warning' ? 'term-warning' : '';
      appendTerminalLine(line.text, cls);
    });
  }
}

window.nextReplayScreen = function() {
  if (currentReplayIndex < PDF_SCREENS.length - 1) {
    renderReplayScreen(currentReplayIndex + 1);
  } else {
    showToast('End of replay sequence.', 'info');
  }
};

window.prevReplayScreen = function() {
  if (currentReplayIndex > 0) {
    renderReplayScreen(currentReplayIndex - 1);
  }
};

window.toggleAutoReplay = function() {
  const btn = document.getElementById('auto-replay-btn');
  if (replayTimer) {
    clearInterval(replayTimer);
    replayTimer = null;
    if (btn) btn.textContent = '▶ Auto Play';
    showToast('Auto-replay paused', 'info');
  } else {
    if (btn) btn.textContent = '⏸ Pause';
    showToast('Auto-replay running...', 'success');
    replayTimer = setInterval(() => {
      if (currentReplayIndex < PDF_SCREENS.length - 1) {
        renderReplayScreen(currentReplayIndex + 1);
      } else {
        renderReplayScreen(0);
      }
    }, 3800);
  }
};

window.resetCliMode = function() {
  if (replayTimer) {
    clearInterval(replayTimer);
    replayTimer = null;
    const btn = document.getElementById('auto-replay-btn');
    if (btn) btn.textContent = '▶ Auto Play';
  }
  clearTerminal();
  showToast('Switched to Interactive Terminal mode!', 'success');
};
