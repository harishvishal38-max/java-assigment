import java.time.LocalDate;

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
        return "----------------------------------------\n"
             + "Complaint ID : " + id + "\n"
             + "Customer     : " + customerName + "\n"
             + "Category     : " + category + "\n"
             + "Description  : " + description + "\n"
             + "Priority     : " + priority + "\n"
             + "Date Filed   : " + dateFiled + "\n"
             + "Status       : " + status + "\n"
             + "Remarks      : " + remarks + "\n"
             + "----------------------------------------";
    }
}
