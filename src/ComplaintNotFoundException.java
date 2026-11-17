public class ComplaintNotFoundException extends Exception {
    public ComplaintNotFoundException(int id) {
        super("No complaint found with ID: " + id);
    }
}
