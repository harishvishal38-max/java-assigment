import java.util.List;
import java.util.Scanner;

public class Main {
    private static final Scanner sc = new Scanner(System.in);
    private static final ComplaintService service = new ComplaintService();

    public static void main(String[] args) {
        System.out.println("===== COMPLAINT REGISTRATION AND TRACKING SYSTEM =====");
        boolean running = true;
        while (running) {
            System.out.println("\n1. Register as Customer");
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
        System.out.println("\nWelcome, " + user.getName() + " [" + user.getRole() + "]");
        boolean back = false;
        while (!back) {
            System.out.println("\n1. File a Complaint");
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
        System.out.println("\nWelcome, " + user.getName() + " [" + user.getRole() + "]");
        boolean back = false;
        while (!back) {
            System.out.println("\n1. View All Complaints");
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
        System.out.println("\n--- Summary Report ---");
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
}
