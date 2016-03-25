"""
EdX.org backend for Python Social Auth
"""
from urllib.parse import urljoin

from django.conf import settings
from social.backends.oauth import BaseOAuth2


class EdxOrgOAuth2(BaseOAuth2):
    """
    EDX.org OAuth2 authentication backend
    """
    name = 'edxorg'
    ID_KEY = 'edx_id'
    REQUEST_TOKEN_URL = None
    EDXORG_BASE_URL = settings.EDXORG_BASE_URL
    AUTHORIZATION_URL = urljoin(EDXORG_BASE_URL, '/oauth2/authorize/')
    ACCESS_TOKEN_URL = urljoin(EDXORG_BASE_URL, '/oauth2/access_token/')
    ACCESS_TOKEN_METHOD = 'POST'
    REDIRECT_STATE = False
    DEFAULT_SCOPE = ['email']

    def user_data(self, access_token, *args, **kwargs):
        """
        Loads user data from service.

        This is the function that has to pull the data from edx

        Args:
            access_token (str): the OAUTH access token

        Returns:
            dict: a dictionary containing user information
                coming from the remote service.
        """
        return self.get_json(
            urljoin(self.EDXORG_BASE_URL, "/api/mobile/v0.5/my_user_info"),
            headers={
                "Authorization": "Bearer {}".format(access_token),
            }
        )

    def get_user_details(self, response):
        """
        Returns user details in a known internal struct.

        This is the function that, given the data coming from edx,
        formats the content to return a dictionary with the keys
        like the following one.

        Args:
            response (dict): dictionary containing user information
                coming from the remote service.

        Returns:
            dict: dictionary with a defined structure containing
                the following keys:
                <remote_id>, `username`, `email`, `fullname`, `first_name`, `last_name`
        """
        full, first, last = self.get_user_names(response['name'])

        return {
            'edx_id': response['username'],
            'username': response['username'],
            'email': response['email'],
            'fullname': full,
            'first_name': first,
            'last_name': last,
        }

    def get_user_id(self, details, response):
        """
        Return a unique ID for the current user, by default from server
        response.

        Args:
            details (dict): the user formatted info coming from `get_user_details`
            response (dict): the user raw info coming from `user_data`

        Returns:
            string: the unique identifier for the user in the remote service.
        """
        return details.get(self.ID_KEY)