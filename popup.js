document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Login
    const loginScreen = document.getElementById('loginScreen');
    const notesScreen = document.getElementById('notesScreen');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.getElementById('loginButton');
    const loginError = document.getElementById('loginError');
    const logoutButton = document.getElementById('logoutButton');

    // DOM Elements - Notes
    const noteInput = document.getElementById('noteInput');
    const saveNoteButton = document.getElementById('saveNoteButton');
    const notesList = document.getElementById('notesList');
    const groupSelect = document.getElementById('groupSelect');
    const groupTabs = document.getElementById('groupTabs');
    const currentGroupLabel = document.getElementById('currentGroupLabel');

    // DOM Elements - Groups Management
    const manageGroupsButton = document.getElementById('manageGroupsButton');
    const groupsModal = document.getElementById('groupsModal');
    const closeGroupsModal = document.getElementById('closeGroupsModal');
    const newGroupInput = document.getElementById('newGroupInput');
    const addGroupButton = document.getElementById('addGroupButton');
    const groupsList = document.getElementById('groupsList');

    //Search Elements
    const searchInput = document.getElementById('searchInput');
    const clearSearchButton = document.getElementById('clearSearchButton');
    const searchResults = document.getElementById('searchResults');

    // Current active group filter
    let currentGroup = 'default';

    // Initialize the app
    chrome.storage.sync.get(['passwordHash', 'notes', 'groups'], function(result) {
        // If groups don't exist yet, create default group
        if (!result.groups) {
            chrome.storage.sync.set({ groups: ['default'] });
        }

        // Event listeners
        if (loginButton) {
            loginButton.addEventListener('click', handleLogin);
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }

        if (saveNoteButton) {
            saveNoteButton.addEventListener('click', saveNote);
        }

        if (manageGroupsButton) {
            manageGroupsButton.addEventListener('click', openGroupsModal);
        }

        if (closeGroupsModal) {
            closeGroupsModal.addEventListener('click', closeModal);
        }

        if (addGroupButton) {
            addGroupButton.addEventListener('click', addGroup);
        }

        // Close modal when clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target === groupsModal) {
                closeModal();
            }
        });
    });

    // Simple hash function for password
    function hashPassword(password) {
        // In a real app, use a more secure hashing algorithm
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // Handle login attempt
    function handleLogin() {
        const password = passwordInput.value;

        if (!password) {
            loginError.textContent = 'Please enter a password';
            return;
        }

        const passwordHash = hashPassword(password);

        chrome.storage.sync.get(['passwordHash'], function(result) {
            if (!result.passwordHash) {
                // First time login, set password
                chrome.storage.sync.set({ passwordHash: passwordHash }, function() {
                    showNotesScreen();
                });
            } else if (result.passwordHash === passwordHash) {
                // Correct password
                showNotesScreen();
            } else {
                // Incorrect password
                loginError.textContent = 'Incorrect password';
            }
        });
    }

    // Handle logout
    function handleLogout() {
        loginScreen.style.display = 'block';
        notesScreen.style.display = 'none';
        passwordInput.value = '';
        loginError.textContent = '';
    }

    // Show notes screen and load groups and notes
    function showNotesScreen() {
        loginScreen.style.display = 'none';
        notesScreen.style.display = 'block';
        loadGroups();
        loadNotes(currentGroup, searchInput?.value?.trim() || '');
    }

    // Load all groups
    function loadGroups() {
        chrome.storage.sync.get(['groups'], function(result) {
            const groups = result.groups || ['default'];

            // Update group select dropdown
            groupSelect.innerHTML = '';

            groups.forEach(function(group) {
                const option = document.createElement('option');
                option.value = group;
                option.textContent = group;
                groupSelect.appendChild(option);
            });

            // Update group tabs
            updateGroupTabs(groups);

            // Update groups list in modal
            updateGroupsList(groups);
        });
    }

    // Update the group tabs
    function updateGroupTabs(groups) {
        groupTabs.innerHTML = '';

        // Add tab for each group
        groups.forEach(function(group) {
            const li = document.createElement('li');
            li.className = 'nav-item';

            const a = document.createElement('a');
            a.className = `nav-link ${currentGroup === group ? 'active' : ''}`;
            a.setAttribute('data-group', group);
            a.textContent = group;

            a.addEventListener('click', function() {
                // Update active tab
                const tabs = groupTabs.querySelectorAll('.nav-link');
                tabs.forEach(tab => tab.classList.remove('active'));
                this.classList.add('active');

                // Filter notes by selected group
                currentGroup = this.getAttribute('data-group');
                loadNotes(currentGroup, searchInput?.value?.trim() || '');
            });

            li.appendChild(a);
            groupTabs.appendChild(li);
        });
    }

    // Update the groups list in the modal
    function updateGroupsList(groups) {
        groupsList.innerHTML = '';

        // Always keep default group
        const defaultLi = document.createElement('li');
        defaultLi.className = 'list-group-item d-flex justify-content-between align-items-center';
        defaultLi.textContent = 'Default';

        const defaultBadge = document.createElement('span');
        defaultBadge.className = 'badge bg-primary';
        defaultBadge.textContent = 'System';

        defaultLi.appendChild(defaultBadge);
        groupsList.appendChild(defaultLi);

        // Add other groups with delete buttons
        groups.forEach(function(group) {
            if (group !== 'default') {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.textContent = group;

                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-danger btn-sm';
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function() {
                    deleteGroup(group);
                });

                li.appendChild(deleteButton);
                groupsList.appendChild(li);
            }
        });
    }

    // Save a new note
    function saveNote() {
        const noteText = noteInput.value.trim();
        const group = groupSelect.value;

        if (!noteText) {
            return;
        }

        chrome.storage.sync.get(['notes'], function(result) {
            const notes = result.notes || [];
            const newNote = {
                id: Date.now(),
                text: noteText,
                group: group,
                timestamp: new Date().toLocaleString()
            };

            notes.push(newNote);

            chrome.storage.sync.set({ notes: notes }, function() {
                noteInput.value = '';
                loadNotes(currentGroup, searchInput?.value?.trim() || '');
            });
        });
    }

    // Load and display notes filtered by group
    function loadNotes(group, searchTerm = '') {
        chrome.storage.sync.get(['notes'], function(result) {
            const notes = result.notes || [];
            notesList.innerHTML = '';
            searchResults.style.display = 'none';

            // Filter notes by group
            let filteredNotes = notes.filter(note => note.group === group);

            // Further filter by search term if provided
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                filteredNotes = filteredNotes.filter(note =>
                    note.text.toLowerCase().includes(searchLower)
                );

                // Show search results count
                searchResults.textContent = `${filteredNotes.length} result${filteredNotes.length !== 1 ? 's' : ''}`;
                searchResults.style.display = 'inline-block';
            }

            if (filteredNotes.length === 0) {
                notesList.innerHTML = searchTerm
                    ? `<p class="text-muted p-2">No notes found matching "${searchTerm}".</p>`
                    : '<p class="text-muted p-2">No notes in this group yet.</p>';
                currentGroupLabel.textContent = ` (${group})`;
                return;
            }

            // Set current group label
            currentGroupLabel.textContent = ` (${group})`;

            // Sort notes by timestamp (newest first)
            filteredNotes.sort((a, b) => b.id - a.id);

            filteredNotes.forEach(function(note) {
                const noteElement = document.createElement('div');
                noteElement.className = 'list-group-item list-group-item-action note-item mb-2';

                const noteContent = document.createElement('div');
                noteContent.className = 'mb-1';
                noteContent.style.whiteSpace = 'pre-wrap';
                noteContent.style.wordBreak = 'break-word';

                // Highlight search term if present
                if (searchTerm) {
                    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
                    noteContent.innerHTML = note.text.replace(regex, '<mark>$1</mark>');
                } else {
                    noteContent.textContent = note.text;
                }

                const metaContainer = document.createElement('div');
                metaContainer.className = 'd-flex justify-content-between align-items-center mt-2';

                const noteTimestamp = document.createElement('div');
                noteTimestamp.className = 'timestamp';
                noteTimestamp.textContent = note.timestamp;

                const groupTag = document.createElement('div');
                groupTag.className = 'group-tag';
                groupTag.textContent = note.group;

                metaContainer.appendChild(noteTimestamp);
                metaContainer.appendChild(groupTag);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.className = 'btn btn-danger btn-sm delete-button';
                deleteButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    deleteNote(note.id);
                });

                noteElement.appendChild(noteContent);
                noteElement.appendChild(metaContainer);
                noteElement.appendChild(deleteButton);
                notesList.appendChild(noteElement);
            });
        });
    }

    // Delete a note
    function deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            chrome.storage.sync.get(['notes'], function(result) {
                const notes = result.notes || [];
                const updatedNotes = notes.filter(note => note.id !== noteId);

                chrome.storage.sync.set({ notes: updatedNotes }, function() {
                    loadNotes(currentGroup, searchInput?.value?.trim() || '');
                });
            });
        }
    }

    // Open the groups management modal
    function openGroupsModal() {
        groupsModal.style.display = 'flex';
        loadGroups();
        newGroupInput.focus();
    }

    // Close the modal
    function closeModal() {
        groupsModal.style.display = 'none';
        newGroupInput.value = '';
    }

    // Add a new group
    function addGroup() {
        const groupName = newGroupInput.value.trim();

        if (!groupName) {
            return;
        }

        chrome.storage.sync.get(['groups'], function(result) {
            const groups = result.groups || ['default'];

            // Check if group already exists
            if (groups.includes(groupName)) {
                alert('A group with this name already exists');
                return;
            }

            // Add new group
            groups.push(groupName);

            chrome.storage.sync.set({ groups: groups }, function() {
                newGroupInput.value = '';
                loadGroups();
            });
        });
    }

    // Delete a group and reassign its notes to default
    function deleteGroup(groupName) {
        if (confirm(`Are you sure you want to delete the group "${groupName}"? All notes in this group will be moved to the Default group.`)) {
            chrome.storage.sync.get(['groups', 'notes'], function(result) {
                const groups = result.groups || ['default'];
                const notes = result.notes || [];

                // Remove group from groups array
                const updatedGroups = groups.filter(g => g !== groupName);

                // Update notes to reassign them to default group
                const updatedNotes = notes.map(note => {
                    if (note.group === groupName) {
                        return {...note, group: 'default'};
                    }
                    return note;
                });

                // If current group is the one being deleted, switch to 'default'
                if (currentGroup === groupName) {
                    currentGroup = 'default';
                }

                // Save updates
                chrome.storage.sync.set({
                    groups: updatedGroups,
                    notes: updatedNotes
                }, function() {
                    loadGroups();
                    loadNotes(currentGroup, searchInput?.value?.trim() || '');
                });
            });
        }
    }

    // Add keyboard event listener for login with Enter key
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Add keyboard event listener for saving note with Ctrl+Enter
    noteInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            saveNote();
        }
    });

    // Add keyboard event listener for adding group with Enter key
    newGroupInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addGroup();
        }
    });

    // Initialize the All tab click event
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-link') && e.target.getAttribute('data-group')) {
            // Update active tab
            const tabs = groupTabs.querySelectorAll('.nav-link');
            tabs.forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');

            // Filter notes by selected group
            currentGroup = e.target.getAttribute('data-group');
            loadNotes(currentGroup);
        }
    }, { once: true });

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            loadNotes(currentGroup, this.value.trim());
        });
    }

    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', function() {
            searchInput.value = '';
            loadNotes(currentGroup);
        });
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
});