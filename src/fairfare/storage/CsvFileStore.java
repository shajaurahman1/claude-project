package fairfare.storage;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Saves a list of objects to a CSV text file and loads them back.
 *
 * OOP concepts:
 *  - ABSTRACTION + INHERITANCE: the file reading/writing is written once
 *    here; subclasses (RateRepository, TripHistory) only say how ONE
 *    object becomes a line of text and back.
 *  - GENERICS: <T> lets the same class store any type of object.
 *
 * Also shows EXCEPTION HANDLING (try-with-resources, IOException).
 */
public abstract class CsvFileStore<T> {

    private final File file;

    protected CsvFileStore(String filePath) {
        this.file = new File(filePath);
    }

    /** First line of the file (column names). */
    protected abstract String getHeader();

    /** Converts one object into one CSV line. */
    protected abstract String toCsvLine(T item);

    /** Converts one CSV line back into an object. */
    protected abstract T fromCsvLine(String[] parts);

    public boolean fileExists() {
        return file.exists();
    }

    /** Reads every object from the file. Bad lines are skipped. */
    protected List<T> loadAll() {
        List<T> items = new ArrayList<>();
        if (!file.exists()) {
            return items;
        }
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line = reader.readLine();          // skip header
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                try {
                    items.add(fromCsvLine(line.split(",", -1)));
                } catch (RuntimeException e) {
                    System.err.println("Skipping bad line in " + file.getName() + ": " + line);
                }
            }
        } catch (IOException e) {
            System.err.println("Could not read " + file.getPath() + ": " + e.getMessage());
        }
        return items;
    }

    /** Writes every object to the file, replacing old contents. */
    protected void saveAll(List<T> items) throws IOException {
        File parent = file.getAbsoluteFile().getParentFile();
        if (parent != null && !parent.exists()) {
            parent.mkdirs();
        }
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
            writer.write(getHeader());
            writer.newLine();
            for (T item : items) {
                writer.write(toCsvLine(item));
                writer.newLine();
            }
        }
    }

    /** Removes commas from text so they do not break the CSV columns. */
    protected static String clean(String text) {
        return text == null ? "" : text.replace(",", " ").trim();
    }
}
