'use strict';

const BASE_URL = 'http://localhost:3000/posts';
const title = document.querySelector('.title');
const body = document.querySelector('.body');
const createButton = document.querySelector('.btn-create');
const loader = document.querySelector('.loader');
const errorElement = document.querySelector('.error');

function setLoading() {
  loader.classList.remove('hide');
}

function setNotLoading() {
  loader.classList.add('hide');
}

function showError(message) {
  errorElement.textContent = message;
  errorElement.classList.remove('hide');
}

async function fetchData() {
  try {
    setLoading();
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return await response.json();
  } catch (error) {
    showError(error.message);
  } finally {
    setNotLoading();
  }
}

async function getData() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const responseObj = await response.json();
    renderPosts(responseObj);
  } catch(error) {
    showError(error.message);
  }
}

getData();

function renderPosts(response) {
  const postList = document.querySelector(".posts");
  postList.innerHTML = '';

  response.forEach((post) => {
    const li = document.createElement("li");
    const h3 = document.createElement("h3");
    const p = document.createElement("p");
    const deleteButton = document.createElement("button");
    const editButton = document.createElement("button");
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.classList.add('btn-save');

    editButton.textContent = 'Edit';
    editButton.classList.add('btn-edit');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('btn-delete');

    h3.textContent = `${post.id} ${post.title}`;
    p.textContent = post.body;

    li.classList.add("post");

    editButton.addEventListener('click', () => {
      const titleInput = document.createElement('input');
      titleInput.classList.add('create-form');
      titleInput.type = 'text';
      titleInput.value = post.title;
      h3.replaceWith(titleInput);
      li.append(saveBtn);
    });

    const id = String(post.id); 

    saveBtn.addEventListener('click', async () => {
      try {
        const updatedTitle = li.querySelector('input').value;

        const response = await fetch(`${BASE_URL}/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ 
            title: updatedTitle,
            body: post.body,
            id: post.id,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          await getData();
        } else {
          throw new Error('Failed to update post');
        }
      } catch(error) {
        showError(`Error: ${error.message}`);
      }
    });

    deleteButton.addEventListener('click', async () => {
      try {
        const response = await fetch(`${BASE_URL}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await getData();
        } else {
          throw new Error('Failed to delete post');
        }
      } catch(error) {
        showError(`Error: ${error.message}`);
      }
    });

    h3.appendChild(editButton);
    h3.appendChild(deleteButton);
    li.appendChild(h3);
    li.appendChild(p);
    postList.appendChild(li);
  });
}

createButton.addEventListener('click', async (event) => {
  event.preventDefault();

  const titleValue = title.value.trim();
  const bodyValue = body.value.trim();

  try {
    const posts = await fetchData();
    const maxId = Math.max(...posts.map(post => post.id));
    const id = String(maxId + 1);

    const response = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({
        title: titleValue,
        body: bodyValue,
        id,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      await getData();
      title.value = ''; 
      body.value = ''; 
    } else {
      throw new Error('Failed to create post');
    }
  } catch(error) {
    showError(`Error: ${error.message}`);
  }
});