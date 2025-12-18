def normalize_tag(tag):
    print(tag.pop("_"))
    newtag = ""
    for char in tag:
        if char.isalpha():
            newtag += char
    return newtag

print(normalize_tag("DSF_dfvEWEF"))