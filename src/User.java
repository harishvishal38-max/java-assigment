public abstract class User {
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
}
