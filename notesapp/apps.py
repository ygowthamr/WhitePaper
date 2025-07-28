<form method="post">
    {% csrf_token %}
    {{ form.non_field_errors }}
    <div>
        {{ form.text.label_tag }}
        {{ form.text }}
        {% for error in form.text.errors %}
            <p style="color: red;">{{ error }}</p>
        {% endfor %}
    </div>
    <button type="submit">Save Note</button>
</form>
