import java.util.ArrayList;
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
}
