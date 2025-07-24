from django.shortcuts import render, redirect
from .forms import NoteForm  # import your new form

def create_note(request):
    if request.method == 'POST':
        form = NoteForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('notes:list')  # change to your actual redirect
    else:
        form = NoteForm()
    
    return render(request, 'notes/create_note.html', {'form': form})
