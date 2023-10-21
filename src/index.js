document.addEventListener('DOMContentLoaded', () => {
    const quoteList = document.querySelector('#quote-list');
    const newQuoteForm = document.querySelector('#new-quote-form');
    const sortButton = document.querySelector('#sort-button');
  
    function loadQuotes() {
      fetch('http://localhost:3000/quotes?_embed=likes')
        .then((response) => response.json())
        .then((quotes) => {
          quoteList.innerHTML = '';
          quotes.forEach((quote) => {
            renderQuote(quote);
          });
        });
    }
  
    // Function to render a single quote
    function renderQuote(quote) {
      const li = document.createElement('li');
  
      li.classList.add('quote-card');
      li.dataset.id = quote.id;
      li.innerHTML = `
        <blockquote class="blockquote">
          <p class="mb-0">${quote.quote}</p>
          <footer class="blockquote-footer">${quote.author}</footer>
          <br>
          <button class='btn-success' data-id="${quote.id}">Likes: <span>${quote.likes.length}</span></button>
          <button class='btn-danger' data-id="${quote.id}">Delete</button>
          <button class='btn-warning' data-id="${quote.id}">Edit</button>
        </blockquote>
      `;
      quoteList.appendChild(li);
  
      const likeButton = li.querySelector('.btn-success');
      likeButton.addEventListener('click', () => handleLike(quote));
  
      const deleteButton = li.querySelector('.btn-danger');
      deleteButton.addEventListener('click', () => handleDelete(quote.id));
  
      const editButton = li.querySelector('.btn-warning');
      editButton.addEventListener('click', () => handleEdit(quote));
    }
  
    // Function to handle the "Like" button click
    function handleLike(quote) {
      const likeButton = document.querySelector(`[data-id="${quote.id}"] .btn-success`);
      const likeCount = likeButton.querySelector('span');
      let currentCount = parseInt(likeCount.textContent, 10);
      currentCount += 1;
  
      const likeData = {
        quoteId: quote.id,
      };
  
      fetch('http://localhost:3000/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(likeData),
      })
        .then((response) => response.json())
        .then(() => {
          likeCount.textContent = currentCount;
        });
    }
  
    // Function to handle the "Delete" button click
    function handleDelete(quoteId) {
      fetch(`http://localhost:3000/quotes/${quoteId}`, {
        method: 'DELETE',
      })
        .then(() => {
          loadQuotes();
        });
    }
  
    // Function to handle the "Edit" button click
    function handleEdit(quote) {
      const quoteText = prompt('Edit the quote:', quote.quote);
      if (quoteText !== null) {
        fetch(`http://localhost:3000/quotes/${quote.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quote: quoteText }),
        })
          .then(() => {
            // Update the edited quote without reloading all quotes
            updateEditedQuote(quote.id, quoteText);
          });
      }
    }
  
    // Function to update the edited quote in the UI
    function updateEditedQuote(quoteId, updatedQuoteText) {
      const quoteElement = document.querySelector(`[data-id="${quoteId}"]`);
      const quoteTextElement = quoteElement.querySelector('.mb-0');
      quoteTextElement.textContent = updatedQuoteText;
    }
  
    // Function to sort quotes by author's name
    function sortQuotesByAuthor() {
      const quoteElements = Array.from(quoteList.querySelectorAll('.quote-card'));
      const sortedQuotes = quoteElements
        .map((quoteElement) => {
          const author = quoteElement.querySelector('.blockquote-footer').textContent;
          return { element: quoteElement, author };
        })
        .sort((a, b) => a.author.localeCompare(b.author));
  
      // Clear the list
      quoteList.innerHTML = '';
  
      // Append sorted quotes to the list
      sortedQuotes.forEach((sortedQuote) => {
        quoteList.appendChild(sortedQuote.element);
      });
    }
  
    // Event listener for the form submission to create a new quote
    newQuoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const quoteInput = newQuoteForm.querySelector('[name="quote"]');
      const authorInput = newQuoteForm.querySelector('[name="author"]');
      const quoteText = quoteInput.value;
      const author = authorInput.value;
  
      fetch('http://localhost:3000/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quote: quoteText,
          author: author,
        }),
      })
        .then(() => {
          loadQuotes();
          quoteInput.value = '';
          authorInput.value = '';
        });
    });
  
    // Event listener for the "Sort" button click
    sortButton.addEventListener('click', () => {
      // Sort the quotes by author's name
      sortQuotesByAuthor();
    });
  
    // Initial loading of quotes when the page loads
    loadQuotes();
  });
  