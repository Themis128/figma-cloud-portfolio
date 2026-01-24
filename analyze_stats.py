import re
import json

with open('D:/Nuxt Projects/new-portfolio/dist/stats.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the data object
match = re.search(r'const data\s*=\s*(\{.*?\});\s*const run', content, re.DOTALL)
if match:
    try:
        data = json.loads(match.group(1))
        tree = data.get('tree', {})
        
        print("=" * 60)
        print("ROLLUP BUNDLE ANALYSIS")
        print("=" * 60)
        print(f"\nBundle Name: {tree.get('name', 'Unknown')}")
        print(f"\nTotal Bundle Sizes:")
        print(f"  - Rendered: {tree.get('renderedLength', 0):,} bytes ({tree.get('renderedLength', 0)/1024:.2f} KB)")
        print(f"  - Gzip:     {tree.get('gzipLength', 0):,} bytes ({tree.get('gzipLength', 0)/1024:.2f} KB)")
        print(f"  - Brotli:   {tree.get('brotliLength', 0):,} bytes ({tree.get('brotliLength', 0)/1024:.2f} KB)")
        
        # Analyze children (top-level chunks)
        children = tree.get('children', [])
        print(f"\n{'=' * 60}")
        print(f"TOP MODULES BY SIZE (Rendered)")
        print(f"{'=' * 60}")
        
        def get_all_modules(node, modules=None, path=""):
            if modules is None:
                modules = []
            
            name = node.get('name', '')
            full_path = f"{path}/{name}" if path else name
            
            if 'children' not in node or not node['children']:
                modules.append({
                    'name': full_path,
                    'rendered': node.get('renderedLength', 0),
                    'gzip': node.get('gzipLength', 0),
                    'brotli': node.get('brotliLength', 0)
                })
            else:
                for child in node.get('children', []):
                    get_all_modules(child, modules, full_path)
            
            return modules
        
        all_modules = get_all_modules(tree)
        sorted_modules = sorted(all_modules, key=lambda x: x['rendered'], reverse=True)
        
        print(f"\nTop 20 Largest Modules:")
        for i, mod in enumerate(sorted_modules[:20], 1):
            size_kb = mod['rendered'] / 1024
            print(f"  {i:2}. {size_kb:8.2f} KB - {mod['name'][-80:]}")
        
        # Analyze by package/directory
        print(f"\n{'=' * 60}")
        print(f"SIZE BY PACKAGE")
        print(f"{'=' * 60}")
        
        packages = {}
        for mod in all_modules:
            parts = mod['name'].split('/')
            # Find node_modules package
            if 'node_modules' in parts:
                idx = parts.index('node_modules')
                if idx + 1 < len(parts):
                    pkg = parts[idx + 1]
                    if pkg.startswith('@') and idx + 2 < len(parts):
                        pkg = f"{parts[idx + 1]}/{parts[idx + 2]}"
                else:
                    pkg = 'node_modules'
            else:
                pkg = 'project'
            
            if pkg not in packages:
                packages[pkg] = {'rendered': 0, 'gzip': 0, 'count': 0}
            packages[pkg]['rendered'] += mod['rendered']
            packages[pkg]['gzip'] += mod['gzip']
            packages[pkg]['count'] += 1
        
        sorted_packages = sorted(packages.items(), key=lambda x: x[1]['rendered'], reverse=True)
        
        print(f"\nTop 20 Largest Packages:")
        for i, (pkg, stats) in enumerate(sorted_packages[:20], 1):
            size_kb = stats['rendered'] / 1024
            gzip_kb = stats['gzip'] / 1024
            print(f"  {i:2}. {size_kb:8.2f} KB (gzip: {gzip_kb:6.2f} KB) - {pkg} ({stats['count']} modules)")
        
        # Summary
        total_rendered = sum(m['rendered'] for m in all_modules)
        total_gzip = sum(m['gzip'] for m in all_modules)
        total_brotli = sum(m['brotli'] for m in all_modules)
        
        print(f"\n{'=' * 60}")
        print(f"SUMMARY")
        print(f"{'=' * 60}")
        print(f"\nTotal Modules: {len(all_modules)}")
        print(f"Total Size: {total_rendered/1024:.2f} KB ({total_rendered/1024/1024:.2f} MB)")
        print(f"Gzip Size:  {total_gzip/1024:.2f} KB ({total_gzip/1024/1024:.2f} MB)")
        print(f"Brotli Size: {total_brotli/1024:.2f} KB ({total_brotli/1024/1024:.2f} MB)")
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print("First 500 chars of match:", match.group(1)[:500])
else:
    print("Could not find data in stats.html")
