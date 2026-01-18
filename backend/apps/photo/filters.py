from django_filters import FilterSet,DateFromToRangeFilter,CharFilter
from .models import Photo
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from django.contrib.postgres.search import SearchQuery,SearchVector,SearchRank, TrigramSimilarity, SearchVectorField

class PhotoFilter(FilterSet):
    upload_time_stamp = DateFromToRangeFilter()
    date_range = CharFilter(method='filter_date_range')
    class Meta:
        model = Photo
        fields = {
           'upload_time_stamp':[],
           'event__event_name':['iexact'],
           'event__event_photographer__name':['iexact'],
           'tag__tag_name':['iexact'],
           'tagged_user__username':['iexact'],
        } #decide whether to use iexact or icontains
    
    def filter_date_range(self, queryset, name, value):
        now = timezone.now()

        if value == "today":
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end = now

        elif value == "this_week":
            start = now - timedelta(days=now.weekday())
            start = start.replace(hour=0, minute=0, second=0, microsecond=0)
            end = now

        elif value == "last_week":
            end = now - timedelta(days=now.weekday() + 1)
            end = end.replace(hour=23, minute=59, second=59)
            start = end - timedelta(days=6)


        elif value == "this_month":
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end = now

        else:
            return queryset

        return queryset.filter(upload_time_stamp__range=(start, end))


# search 
#Can Explain via tags (Full Text Search)
#Can Directly use Trigram for typos(in case of event_name,photographer,username)
def search(search_query,queryset):
    vector = SearchVector('tag__tag_name',weight='A')
    query = SearchQuery(search_query ,search_type='websearch',config='english')
    # using TrigramSimilarity for event photographer, event_name, tagged_users
    photo1=queryset.annotate(
        event_name_sim = TrigramSimilarity('event__event_name',search_query),
        photographer_sim = TrigramSimilarity('event__event_photographer__name',search_query),
        tagged_user_sim = TrigramSimilarity('tagged_user__username',search_query),
        # tag_sim = TrigramSimilarity('tag__tag_name',search_query)
    ).filter(
         Q(event_name_sim__gt=0.3) |
         Q(photographer_sim__gt=0.3) |
         Q(tagged_user_sim__gt = 0.5) 
        #  Q(tag_sim__gt = 0.3)
    ).order_by("-event_name_sim")

    #Why the hell its not working WTF is going on here
    # photo2 = queryset.annotate(tag_sim = SearchRank("search_field",query=query)).filter(tag_sim__gt=0.3).order_by('tag_sim')
    photo2=queryset.annotate(search=vector).filter(search=query) #Its bullshit

    photo = (photo1 | photo2).distinct()

    return photo
