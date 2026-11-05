const API_URL = "/api/books";

// Display messages
function showMessage(message, type = "success") {
    const box = document.getElementById("message");

    if (box) {
        box.textContent = message;
        box.className = "message " + type;
    } else {
        alert(message);
    }
}

// Get all books
async function getBooks() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch books");
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Add Book
const addForm = document.getElementById("addBookForm");

if (addForm) {
    addForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const book = {
            title: document.getElementById("title").value.trim(),
            author: document.getElementById("author").value.trim(),
            category: document.getElementById("category").value,
            price: Number(document.getElementById("price").value),
            stock: Number(document.getElementById("stock").value)
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(book)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to add book");
            }

            showMessage("Book added successfully!");
            addForm.reset();
        } catch (error) {
            showMessage(error.message, "error");
        }
    });
}// Display books in table
async function displayBooks() {
    const tableBody = document.getElementById("bookTableBody");

    if (!tableBody) return;

    const books = await getBooks();
    tableBody.replaceChildren();

    if (books.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.textContent = "No books found.";
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    books.forEach(book => {
        const row = document.createElement("tr");

        [
            book.book_id,
            book.title,
            book.author,
            book.category,
            "₹" + book.price,
            book.stock
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

// Search and category filter
const searchInput = document.getElementById("searchBook");
const categoryFilter = document.getElementById("filterCategory");

async function filterBooks() {
    const books = await getBooks();

    const searchText = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    const filtered = books.filter(book =>
        (book.title.toLowerCase().includes(searchText) ||
         book.author.toLowerCase().includes(searchText)) &&
        (!category || book.category === category)
    );

    const tableBody = document.getElementById("bookTableBody");
    tableBody.replaceChildren();

    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.textContent = "No matching books found.";
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    filtered.forEach(book => {
        const row = document.createElement("tr");

        [
            book.book_id,
            book.title,
            book.author,
            book.category,
            "₹" + book.price,
            book.stock
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

if (searchInput && categoryFilter) {
    searchInput.addEventListener("input", filterBooks);
    categoryFilter.addEventListener("change", filterBooks);
}// Update Book
const updateForm = document.getElementById("updateBookForm");

if (updateForm) {
    updateForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const id = document.getElementById("bookId").value;

        const book = {
            title: document.getElementById("title").value.trim(),
            author: document.getElementById("author").value.trim(),
            category: document.getElementById("category").value,
            price: Number(document.getElementById("price").value),
            stock: Number(document.getElementById("stock").value)
        };

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(book)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to update book");
            }

            showMessage("Book updated successfully!");
            updateForm.reset();
        } catch (error) {
            showMessage(error.message, "error");
        }
    });
}

// Delete Book
const deleteForm = document.getElementById("deleteBookForm");

if (deleteForm) {
    deleteForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const id = document.getElementById("bookId").value;

        if (!confirm("Are you sure you want to delete this book?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to delete book");
            }

            showMessage("Book deleted successfully!");
            deleteForm.reset();
        } catch (error) {
            showMessage(error.message, "error");
        }
    });
}

// Dashboard information
async function loadDashboard() {
    const totalBooks = document.getElementById("totalBooks");

    if (!totalBooks) return;

    const books = await getBooks();

    totalBooks.textContent = books.length;

    document.getElementById("totalStock").textContent =
        books.reduce((sum, book) => sum + Number(book.stock), 0);

    document.getElementById("totalCategories").textContent =
        new Set(books.map(book => book.category)).size;

    const lowStock = books.filter(book => Number(book.stock) <= 5);

    document.getElementById("lowStockMessage").textContent =
        lowStock.length
            ? lowStock.length + " book(s) have low stock."
            : "All books have sufficient stock.";
}

// Load page data
displayBooks();
loadDashboard();