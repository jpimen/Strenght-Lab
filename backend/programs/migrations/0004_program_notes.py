# Generated migration for adding notes field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('programs', '0003_cycle'),
    ]

    operations = [
        migrations.AddField(
            model_name='program',
            name='notes',
            field=models.TextField(blank=True, default='', help_text='Rich HTML formatted program notes and coaching cues'),
        ),
    ]
