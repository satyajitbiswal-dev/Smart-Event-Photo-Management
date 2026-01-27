from django.db.models import Q, Value
from django.contrib.postgres.search import (SearchQuery, SearchVector, SearchRank,TrigramSimilarity,)
from django.db.models.functions import Greatest
from django.contrib.postgres.aggregates import StringAgg
from django_filters import FilterSet, DateFromToRangeFilter, CharFilter
from django.utils import timezone
from datetime import timedelta
from .models import Photo

class PhotoFilter(FilterSet):
    upload_time_stamp = DateFromToRangeFilter()
    date_range = CharFilter(method="filter_date_range")

    class Meta:
        model = Photo
        fields = {
            "upload_time_stamp": [],
            "event__event_name": ["icontains"],
            "event__event_photographer__name": ["icontains"],
            "tag__tag_name": ["icontains"],
            "tagged_user__username": ["icontains"],
        }

    def filter_date_range(self, queryset, name, value):
        now = timezone.now()

        ranges = {
            "today": (
                now.replace(hour=0, minute=0, second=0, microsecond=0),
                now,
            ),
            "this_week": (
                now - timedelta(days=now.weekday()),
                now,
            ),
            "last_week": (
                (now - timedelta(days=now.weekday() + 7)),
                (now - timedelta(days=now.weekday() + 1)),
            ),
            "this_month": (
                now.replace(day=1, hour=0, minute=0, second=0, microsecond=0),
                now,
            ),
        }

        if value not in ranges:
            return queryset

        start, end = ranges[value]
        return queryset.filter(upload_time_stamp__range=(start, end))


# search 
#Can Explain via tags (Full Text Search)
#Can Directly use Trigram for typos(in case of event_name,photographer,username)
# from django.db.models import Q, F
# from django.contrib.postgres.search import (
#     SearchQuery,
#     SearchVector,
#     SearchRank,
#     TrigramSimilarity,
# )
# from django.contrib.postgres.aggregates import StringAgg
# from django.db.models.functions import Greatest

# def search(search_query, queryset):
#     query = SearchQuery(search_query, search_type="websearch")

#     queryset = (
#         queryset
#         .annotate(
#             tag_text=StringAgg(
#                 "tag__tag_name",
#                 delimiter=" ",
#                 distinct=True,
#             )
#         )
#         .annotate(
#             tag_vector=SearchVector("tag_text", weight="A"),
#             tag_rank=SearchRank(F("tag_vector"), query),

#             event_sim=TrigramSimilarity("event__event_name", search_query),
#             photographer_sim=TrigramSimilarity(
#                 "event__event_photographer__name",
#                 search_query,
#             ),
#             tagged_user_sim=TrigramSimilarity(
#                 "tagged_user__username",
#                 search_query,
#             ),

#             similarity=Greatest(
#                 "event_sim",
#                 "photographer_sim",
#                 "tagged_user_sim",
#             ),
#         )
#         .filter(
#             Q(tag_rank__gt=0.05) |
#             Q(similarity__gt=0.2)
#         )
#         .order_by(
#             "-tag_rank",
#             "-similarity",
#         )
#         .distinct()
#     )

#     return queryset


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