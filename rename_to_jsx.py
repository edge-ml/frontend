import os

def rename_js_to_jsx(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.js'):
                base = os.path.splitext(file)[0]
                new_name = base + '.jsx'
                old_file = os.path.join(root, file)
                new_file = os.path.join(root, new_name)
                os.rename(old_file, new_file)
                print(f'Renamed: {old_file} to {new_file}')

# Example usage
rename_js_to_jsx('.')
